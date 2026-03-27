"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { localdb, markAsSynced } from "@/lib/localdb";
import type { Sermon } from "@/types/sermon";

async function fetchSermons(limit?: number): Promise<Sermon[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));

  const url = `/api/sermons${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch sermons");
  }

  return res.json();
}

async function fetchSermon(id: string): Promise<Sermon> {
  const res = await fetch(`/api/sermons/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch sermon");
  }

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
  return useQuery({
    queryKey: queryKeys.sermons.list(limit),
    queryFn: () => fetchSermonsWithLocalSync(limit),
    staleTime: 30 * 1000,
  });
}

export function useSermon(id: string) {
  return useQuery({
    queryKey: queryKeys.sermons.detail(id),
    queryFn: () => fetchSermonWithLocalSync(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
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
      const { createSermonWithTitle } = await import("@/lib/sermon-actions");
      return createSermonWithTitle(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sermons.all });
    },
  });
}

export function useDeleteSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sermonId: string) => {
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
