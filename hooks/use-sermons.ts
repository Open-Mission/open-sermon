"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { localdb, markAsSynced } from "@/lib/localdb";
import type { Sermon } from "@/types/sermon";
import { offlineDb } from "@/lib/offline-db";
import { syncService } from "@/lib/sync-service";
import { useState, useEffect } from "react";

async function fetchSermons(limit?: number): Promise<Sermon[]> {
  const res = await fetch(`/api/sermons${limit ? `?limit=${limit}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch sermons");
  return res.json();
}

async function fetchSermon(id: string): Promise<Sermon> {
  const res = await fetch(`/api/sermons/${id}`);
  if (!res.ok) throw new Error("Failed to fetch sermon");
  return res.json();
}

async function fetchSermonWithLocalSync(id: string): Promise<Sermon> {
  const localSermon = await localdb.getSermon(id);

  try {
    const serverSermon = await fetchSermon(id);
    await localdb.saveSermon(serverSermon);
    await markAsSynced(serverSermon.id);
    return serverSermon;
  } catch (error) {
    if (localSermon) {
      return localSermon;
    }
    throw error;
  }
}

async function fetchSermonsWithLocalSync(limit?: number): Promise<Sermon[]> {
  const localSermons = await localdb.getSermons();

  try {
    const serverSermons = await fetchSermons(limit);
    await localdb.saveSermons(serverSermons);
    return serverSermons;
  } catch (error) {
    if (localSermons.length > 0) {
      return localSermons;
    }
    throw error;
  }
}

export function useSermons(limit?: number) {
  const [offlineSermons, setOfflineSermons] = useState<Sermon[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadOfflineData = async () => {
      if (!navigator.onLine) {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const sermons = await offlineDb.getAllSermons(userId);
          setOfflineSermons(sermons);
          setIsOffline(true);
        }
      }
    };
    loadOfflineData();

    const handleOffline = () => {
      setIsOffline(true);
      loadOfflineData();
    };
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const query = useQuery({
    queryKey: queryKeys.sermons.list(limit),
    queryFn: () => fetchSermonsWithLocalSync(limit),
    staleTime: 30 * 1000,
    enabled: !isOffline,
  });

  useEffect(() => {
    if (query.data && !isOffline) {
      const userId = query.data[0]?.user_id;
      if (userId) {
        offlineDb.saveSermons(query.data);
        localStorage.setItem("userId", userId);
      }
    }
  }, [query.data, isOffline]);

  if (isOffline) {
    return {
      ...query,
      data: offlineSermons,
      isLoading: false,
      isFetching: false,
    };
  }

  return query;
}

export function useSermon(id: string) {
  const [offlineSermon, setOfflineSermon] = useState<Sermon | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadOfflineData = async () => {
      if (!navigator.onLine && id) {
        const sermon = await offlineDb.getSermon(id);
        setOfflineSermon(sermon ?? null);
        setIsOffline(true);
      }
    };
    loadOfflineData();

    const handleOffline = () => {
      setIsOffline(true);
      loadOfflineData();
    };
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [id]);

  const query = useQuery({
    queryKey: queryKeys.sermons.detail(id),
    queryFn: () => fetchSermonWithLocalSync(id),
    staleTime: 60 * 1000,
    enabled: !!id && !isOffline,
  });

  useEffect(() => {
    if (query.data && !isOffline) {
      offlineDb.saveSermon(query.data);
      localStorage.setItem("userId", query.data.user_id);
    }
  }, [query.data, isOffline]);

  if (isOffline) {
    return {
      ...query,
      data: offlineSermon,
      isLoading: false,
      isFetching: false,
    };
  }

  return query;
}

export function useSermonOfflineStatus(id: string) {
  return useQuery({
    queryKey: [...queryKeys.sermons.detail(id), "offline-status"],
    queryFn: async () => {
      const meta = await localdb.getMeta(id);
      return {
        isOfflineAvailable: meta?.isOfflineAvailable ?? false,
        syncedAt: meta?.syncedAt ?? null,
      };
    },
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useCreateSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!navigator.onLine) {
        const sermon = await syncService.createSermonOffline(title);
        return { success: true, sermonId: sermon.id };
      }

      const { createSermonWithTitle } = await import("@/lib/sermon-actions");
      return createSermonWithTitle(title);
    },
    onSuccess: (result) => {
      if (result.success && !offlineDb.isLocalId(result.sermonId!)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sermons.all });
      }
    },
  });
}

export function useDeleteSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sermonId: string) => {
      if (!navigator.onLine || offlineDb.isLocalId(sermonId)) {
        await syncService.deleteSermonOffline(sermonId);
        return { success: true };
      }

      const { softDeleteSermon } = await import("@/lib/sermon-actions");
      await localdb.deleteSermon(sermonId);
      return softDeleteSermon(sermonId);
    },
    onMutate: async (sermonId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sermons.all });

      const previousSermons = queryClient.getQueryData<Sermon[]>(
        queryKeys.sermons.list()
      );

      queryClient.setQueriesData<Sermon[]>(
        { queryKey: queryKeys.sermons.all },
        (old) => old?.filter((s) => s.id !== sermonId) ?? []
      );

      return { previousSermons };
    },
    onError: (_err, _id, context) => {
      if (context?.previousSermons) {
        queryClient.setQueryData(
          queryKeys.sermons.list(),
          context.previousSermons
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sermons.all });
    },
  });
}

export function useRenameSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sermonId,
      newTitle,
    }: {
      sermonId: string;
      newTitle: string;
    }) => {
      if (!navigator.onLine || offlineDb.isLocalId(sermonId)) {
        await syncService.updateSermonOffline(sermonId, { title: newTitle });
        return { success: true };
      }

      const { renameSermon } = await import("@/lib/sermon-actions");
      return renameSermon(sermonId, newTitle);
    },
    onMutate: async ({ sermonId, newTitle }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sermons.all });

      queryClient.setQueriesData<Sermon[]>(
        { queryKey: queryKeys.sermons.all },
        (old) =>
          old?.map((s) =>
            s.id === sermonId ? { ...s, title: newTitle } : s
          ) ?? []
      );

      queryClient.setQueryData<Sermon>(
        queryKeys.sermons.detail(sermonId),
        (old) => (old ? { ...old, title: newTitle } : old)
      );
    },
    onSettled: (_data, _err, { sermonId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sermons.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sermons.detail(sermonId),
      });
    },
  });
}
