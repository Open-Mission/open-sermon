"use client";

import { createClient } from "@/lib/supabase/client";
import { offlineDb, type PendingOperation } from "./offline-db";
import type { Sermon } from "@/types/sermon";

type SyncStatus = "idle" | "syncing" | "error" | "offline";

type SyncListener = (status: SyncStatus, pendingCount: number) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private userId: string | null = null;

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(status: SyncStatus, pendingCount: number) {
    this.listeners.forEach((listener) => listener(status, pendingCount));
  }

  async initialize(userId: string) {
    this.userId = userId;

    await this.pullFromServer();

    if (navigator.onLine) {
      await this.syncPendingOperations();
    }

    this.startSyncInterval();

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  private startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncPendingOperations();
      }
    }, 30000);
  }

  private handleOnline = async () => {
    this.notify("syncing", 0);
    await this.syncPendingOperations();
    await this.pullFromServer();
  };

  private handleOffline = () => {
    this.notify("offline", 0);
  };

  async pullFromServer(): Promise<void> {
    if (!this.userId || !navigator.onLine) return;

    try {
      const supabase = createClient();
      const { data: sermons, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("user_id", this.userId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (sermons) {
        await offlineDb.saveSermons(sermons as Sermon[]);
        await offlineDb.setLastSync(this.userId, Date.now());
      }
    } catch (error) {
      console.error("Pull from server failed:", error);
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    this.notify("syncing", 0);

    try {
      const pendingOps = await offlineDb.getPendingOperations();
      const supabase = createClient();

      for (const op of pendingOps) {
        try {
          await this.processOperation(op, supabase);
          await offlineDb.removePendingOperation(op.id);

          if (offlineDb.isLocalId(op.sermonId)) {
            await offlineDb.deleteSermon(op.sermonId);
          }
        } catch (error) {
          console.error(`Failed to process operation ${op.id}:`, error);
          await offlineDb.incrementRetry(op.id);

          if (op.retries >= 5) {
            await offlineDb.removePendingOperation(op.id);
          }
        }
      }

      const remaining = await offlineDb.getPendingOperations();
      this.notify("idle", remaining.length);
    } catch (error) {
      console.error("Sync failed:", error);
      const pending = await offlineDb.getPendingOperations();
      this.notify("error", pending.length);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(
    op: PendingOperation,
    supabase: ReturnType<typeof createClient>
  ): Promise<void> {
    switch (op.type) {
      case "create": {
        if (!op.data) return;

        if (offlineDb.isLocalId(op.sermonId)) {
          const { data: newSermon, error } = await supabase
            .from("sermons")
            .insert({
              user_id: op.data.user_id,
              title: op.data.title,
              blocks: op.data.blocks,
              status: op.data.status,
              type: op.data.type,
              main_scripture: op.data.main_scripture,
              tags: op.data.tags,
            })
            .select()
            .single();

          if (error) throw error;

          if (newSermon) {
            await offlineDb.saveSermon(newSermon as Sermon);
          }
        } else {
          const { error } = await supabase
            .from("sermons")
            .update(op.data)
            .eq("id", op.sermonId);

          if (error) throw error;
        }
        break;
      }

      case "update": {
        if (!op.data) return;

        const { error } = await supabase
          .from("sermons")
          .update({
            ...op.data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", op.sermonId);

        if (error) throw error;

        const localSermon = await offlineDb.getSermon(op.sermonId);
        if (localSermon) {
          await offlineDb.saveSermon({
            ...localSermon,
            ...op.data,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case "delete": {
        const { error } = await supabase
          .from("sermons")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", op.sermonId);

        if (error) throw error;

        await offlineDb.deleteSermon(op.sermonId);
        break;
      }
    }
  }

  async createSermonOffline(title: string): Promise<Sermon> {
    if (!this.userId) throw new Error("User not initialized");

    const id = await offlineDb.generateLocalId();
    const now = new Date().toISOString();

    const sermon: Sermon = {
      id,
      user_id: this.userId,
      series_id: null,
      title: title || "Novo Sermão",
      slug: null,
      status: "draft",
      type: "preaching",
      main_scripture: null,
      tags: [],
      blocks: [],
      preached_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      is_favorite: false,
      is_public: false,
    };

    await offlineDb.saveSermon(sermon);

    await offlineDb.addPendingOperation({
      type: "create",
      sermonId: id,
      data: sermon,
    });

    const pending = await offlineDb.getPendingOperations();
    this.notify(navigator.onLine ? "syncing" : "offline", pending.length);

    if (navigator.onLine) {
      this.syncPendingOperations();
    }

    return sermon;
  }

  async updateSermonOffline(
    sermonId: string,
    data: Partial<Sermon>
  ): Promise<void> {
    const localSermon = await offlineDb.getSermon(sermonId);

    if (localSermon) {
      const updated = {
        ...localSermon,
        ...data,
        updated_at: new Date().toISOString(),
      };
      await offlineDb.saveSermon(updated);
    }

    await offlineDb.addPendingOperation({
      type: "update",
      sermonId,
      data,
    });

    const pending = await offlineDb.getPendingOperations();
    this.notify(navigator.onLine ? "syncing" : "offline", pending.length);

    if (navigator.onLine) {
      this.syncPendingOperations();
    }
  }

  async deleteSermonOffline(sermonId: string): Promise<void> {
    await offlineDb.deleteSermon(sermonId);

    if (!offlineDb.isLocalId(sermonId)) {
      await offlineDb.addPendingOperation({
        type: "delete",
        sermonId,
      });
    }

    const pending = await offlineDb.getPendingOperations();
    this.notify(navigator.onLine ? "syncing" : "offline", pending.length);

    if (navigator.onLine) {
      this.syncPendingOperations();
    }
  }

  async getPendingCount(): Promise<number> {
    const pending = await offlineDb.getPendingOperations();
    return pending.length;
  }
}

export const syncService = new SyncService();
export type { SyncStatus };
