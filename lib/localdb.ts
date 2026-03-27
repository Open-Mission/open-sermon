"use client";

import type { Sermon } from "@/types/sermon";

const DB_NAME = "open-sermon-db";
const DB_VERSION = 1;
const SERMONS_STORE = "sermons";
const META_STORE = "meta";

export interface SermonMeta {
  id: string;
  syncedAt: string;
  isOfflineAvailable: boolean;
}

interface LocalDB {
  getSermon: (id: string) => Promise<Sermon | null>;
  getSermons: () => Promise<Sermon[]>;
  saveSermon: (sermon: Sermon) => Promise<void>;
  saveSermons: (sermons: Sermon[]) => Promise<void>;
  deleteSermon: (id: string) => Promise<void>;
  getMeta: (id: string) => Promise<SermonMeta | null>;
  setMeta: (meta: SermonMeta) => Promise<void>;
  clearAll: () => Promise<void>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB not available on server"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(SERMONS_STORE)) {
        const sermonStore = db.createObjectStore(SERMONS_STORE, {
          keyPath: "id",
        });
        sermonStore.createIndex("updated_at", "updated_at", { unique: false });
        sermonStore.createIndex("user_id", "user_id", { unique: false });
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
    };
  });
}

export const localdb: LocalDB = {
  async getSermon(id: string): Promise<Sermon | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SERMONS_STORE, "readonly");
        const store = transaction.objectStore(SERMONS_STORE);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error("localdb.getSermon error:", error);
      return null;
    }
  },

  async getSermons(): Promise<Sermon[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SERMONS_STORE, "readonly");
        const store = transaction.objectStore(SERMONS_STORE);
        const index = store.index("updated_at");
        const request = index.openCursor(null, "prev");
        const sermons: Sermon[] = [];

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (cursor) {
            sermons.push(cursor.value);
            cursor.continue();
          } else {
            resolve(sermons);
          }
        };
      });
    } catch (error) {
      console.error("localdb.getSermons error:", error);
      return [];
    }
  },

  async saveSermon(sermon: Sermon): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SERMONS_STORE, "readwrite");
        const store = transaction.objectStore(SERMONS_STORE);
        const request = store.put(sermon);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error("localdb.saveSermon error:", error);
    }
  },

  async saveSermons(sermons: Sermon[]): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SERMONS_STORE, "readwrite");
        const store = transaction.objectStore(SERMONS_STORE);

        for (const sermon of sermons) {
          store.put(sermon);
        }

        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } catch (error) {
      console.error("localdb.saveSermons error:", error);
    }
  },

  async deleteSermon(id: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SERMONS_STORE, "readwrite");
        const store = transaction.objectStore(SERMONS_STORE);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error("localdb.deleteSermon error:", error);
    }
  },

  async getMeta(id: string): Promise<SermonMeta | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(META_STORE, "readonly");
        const store = transaction.objectStore(META_STORE);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error("localdb.getMeta error:", error);
      return null;
    }
  },

  async setMeta(meta: SermonMeta): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(META_STORE, "readwrite");
        const store = transaction.objectStore(META_STORE);
        const request = store.put(meta);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error("localdb.setMeta error:", error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [SERMONS_STORE, META_STORE],
          "readwrite"
        );

        transaction.objectStore(SERMONS_STORE).clear();
        transaction.objectStore(META_STORE).clear();

        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } catch (error) {
      console.error("localdb.clearAll error:", error);
    }
  },
};

export function isOfflineAvailable(meta: SermonMeta | null): boolean {
  if (!meta) return false;
  return meta.isOfflineAvailable;
}

export async function markAsSynced(sermonId: string): Promise<void> {
  await localdb.setMeta({
    id: sermonId,
    syncedAt: new Date().toISOString(),
    isOfflineAvailable: true,
  });
}
