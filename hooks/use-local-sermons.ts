"use client";

import { useState, useEffect, useCallback } from "react";
import { localdb, markAsSynced, type SermonMeta } from "@/lib/localdb";
import type { Sermon } from "@/types/sermon";

interface UseOfflineSermonResult {
  localSermon: Sermon | null;
  isOfflineAvailable: boolean;
  isLoadingLocal: boolean;
  syncWithServer: (serverSermon: Sermon) => Promise<void>;
}

export function useOfflineSermon(sermonId: string): UseOfflineSermonResult {
  const [localSermon, setLocalSermon] = useState<Sermon | null>(null);
  const [meta, setMeta] = useState<SermonMeta | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  useEffect(() => {
    if (!sermonId) {
      setIsLoadingLocal(false);
      return;
    }

    async function loadLocalData() {
      try {
        const [sermon, sermonMeta] = await Promise.all([
          localdb.getSermon(sermonId),
          localdb.getMeta(sermonId),
        ]);
        setLocalSermon(sermon);
        setMeta(sermonMeta);
      } catch (error) {
        console.error("Error loading local sermon:", error);
      } finally {
        setIsLoadingLocal(false);
      }
    }

    loadLocalData();
  }, [sermonId]);

  const syncWithServer = useCallback(async (serverSermon: Sermon) => {
    await localdb.saveSermon(serverSermon);
    await markAsSynced(serverSermon.id);
    setLocalSermon(serverSermon);
    setMeta({
      id: serverSermon.id,
      syncedAt: new Date().toISOString(),
      isOfflineAvailable: true,
    });
  }, []);

  return {
    localSermon,
    isOfflineAvailable: meta?.isOfflineAvailable ?? false,
    isLoadingLocal,
    syncWithServer,
  };
}

interface UseOfflineSermonsResult {
  localSermons: Sermon[];
  isLoadingLocal: boolean;
  syncSermons: (sermons: Sermon[]) => Promise<void>;
}

export function useOfflineSermons(): UseOfflineSermonsResult {
  const [localSermons, setLocalSermons] = useState<Sermon[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  useEffect(() => {
    async function loadLocalSermons() {
      try {
        const sermons = await localdb.getSermons();
        setLocalSermons(sermons);
      } catch (error) {
        console.error("Error loading local sermons:", error);
      } finally {
        setIsLoadingLocal(false);
      }
    }

    loadLocalSermons();
  }, []);

  const syncSermons = useCallback(async (sermons: Sermon[]) => {
    await localdb.saveSermons(sermons);
    setLocalSermons(sermons);
  }, []);

  return {
    localSermons,
    isLoadingLocal,
    syncSermons,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
