import { createClient } from "@/lib/supabase/server";
import { getCached, sermonsCacheKey, sermonCacheKey } from "@/lib/redis";
import type { Sermon } from "@/types/sermon";

export async function getSermons(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const cacheKey = sermonsCacheKey(user.id, limit);

  return getCached<Sermon[]>(
    cacheKey,
    async () => {
      let query = supabase
        .from("sermons")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: sermons, error } = await query;

      if (error) {
        console.error("getSermons - Error:", error);
        return [];
      }

      return (sermons || []) as Sermon[];
    },
    30
  );
}

export async function getFavoriteSermons() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: sermons, error } = await supabase
    .from("sermons")
    .select("*")
    .is("deleted_at", null)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getFavoriteSermons - Error:", error);
    return [];
  }

  return (sermons || []) as Sermon[];
}

export async function getSermon(id: string) {
  const supabase = await createClient();
  const cacheKey = sermonCacheKey(id);

  return getCached<Sermon | null>(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("getSermon - Error:", error);
        return null;
      }

      return data as Sermon;
    },
    60
  );
}
