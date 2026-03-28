"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Sermon } from "@/types/sermon";

const DB_NAME = "open-sermon-db";
const DB_VERSION = 1;

interface PendingOperation {
  id: string;
  type: "create" | "update" | "delete";
  sermonId: string;
  data?: Partial<Sermon>;
  timestamp: number;
  retries: number;
}

interface OfflineDBSchema extends DBSchema {
  sermons: {
    key: string;
    value: Sermon;
    indexes: {
      "by-user": string;
      "by-updated": string;
    };
  };
  pendingOperations: {
    key: string;
    value: PendingOperation;
    indexes: {
      "by-sermon": string;
      "by-timestamp": number;
    };
  };
  syncMetadata: {
    key: string;
    value: {
      key: string;
      lastSync: number;
      userId: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null;

async function getDB(): Promise<IDBPDatabase<OfflineDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("sermons")) {
          const sermonStore = db.createObjectStore("sermons", {
            keyPath: "id",
          });
          sermonStore.createIndex("by-user", "user_id");
          sermonStore.createIndex("by-updated", "updated_at");
        }

        if (!db.objectStoreNames.contains("pendingOperations")) {
          const pendingStore = db.createObjectStore("pendingOperations", {
            keyPath: "id",
          });
          pendingStore.createIndex("by-sermon", "sermonId");
          pendingStore.createIndex("by-timestamp", "timestamp");
        }

        if (!db.objectStoreNames.contains("syncMetadata")) {
          db.createObjectStore("syncMetadata", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export type { PendingOperation };

export const offlineDb = {
  async getAllSermons(userId: string): Promise<Sermon[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex("sermons", "by-user", userId);
    return all.filter((s) => !s.deleted_at).sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  async getSermon(id: string): Promise<Sermon | undefined> {
    const db = await getDB();
    return db.get("sermons", id);
  },

  async saveSermon(sermon: Sermon): Promise<void> {
    const db = await getDB();
    await db.put("sermons", sermon);
  },

  async saveSermons(sermons: Sermon[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("sermons", "readwrite");
    await Promise.all([
      ...sermons.map((s) => tx.store.put(s)),
      tx.done,
    ]);
  },

  async deleteSermon(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("sermons", id);
  },

  async clearSermons(userId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("sermons", "readwrite");
    const index = tx.store.index("by-user");
    let cursor = await index.openCursor(IDBKeyRange.only(userId));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  async addPendingOperation(
    operation: Omit<PendingOperation, "id" | "timestamp" | "retries">
  ): Promise<PendingOperation> {
    const db = await getDB();
    const pendingOp: PendingOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };
    await db.put("pendingOperations", pendingOp);
    return pendingOp;
  },

  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex("pendingOperations", "by-timestamp");
  },

  async getPendingOperationsBySermon(
    sermonId: string
  ): Promise<PendingOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex("pendingOperations", "by-sermon", sermonId);
  },

  async removePendingOperation(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("pendingOperations", id);
  },

  async incrementRetry(id: string): Promise<void> {
    const db = await getDB();
    const op = await db.get("pendingOperations", id);
    if (op) {
      op.retries++;
      await db.put("pendingOperations", op);
    }
  },

  async clearPendingOperations(): Promise<void> {
    const db = await getDB();
    await db.clear("pendingOperations");
  },

  async getLastSync(userId: string): Promise<number | null> {
    const db = await getDB();
    const meta = await db.get("syncMetadata", `lastSync:${userId}`);
    return meta?.lastSync ?? null;
  },

  async setLastSync(userId: string, timestamp: number): Promise<void> {
    const db = await getDB();
    await db.put("syncMetadata", {
      key: `lastSync:${userId}`,
      lastSync: timestamp,
      userId,
    });
  },

  async generateLocalId(): Promise<string> {
    return `local-${crypto.randomUUID()}`;
  },

  isLocalId(id: string): boolean {
    return id.startsWith("local-");
  },
};
