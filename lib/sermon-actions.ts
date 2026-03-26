"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { invalidateCache, invalidateCacheKey, sermonCacheKey } from "@/lib/redis";

async function invalidateUserSermonCache(userId: string) {
  await invalidateCache(`sermons:${userId}:*`);
}

export async function createSermon() {
  const supabase = await createClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: sermon, error } = await supabase
    .from("sermons")
    .insert({
      user_id: user.id,
      title: "Novo Sermão",
    })
    .select()
    .single();

  if (error || !sermon) {
    throw new Error(error?.message || "Erro ao criar sermão");
  }

  await invalidateUserSermonCache(user.id);
  revalidatePath("/", "layout");
  redirect(`/${locale}/sermons/${sermon.id}`);
}

export async function createSermonWithTitle(title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: sermon, error } = await supabase
    .from("sermons")
    .insert({
      user_id: user.id,
      title: title.trim() || "New Sermon",
    })
    .select()
    .single();

  if (error || !sermon) {
    return { error: error?.message || "Failed to create sermon" };
  }

  await invalidateUserSermonCache(user.id);
  revalidatePath("/", "layout");
  return { success: true, sermonId: sermon.id };
}

export async function softDeleteSermon(sermonId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("sermons")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sermonId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  await Promise.all([
    invalidateUserSermonCache(user.id),
    invalidateCacheKey(sermonCacheKey(sermonId)),
  ]);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function renameSermon(sermonId: string, newTitle: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("sermons")
    .update({ title: newTitle.trim() })
    .eq("id", sermonId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  await Promise.all([
    invalidateUserSermonCache(user.id),
    invalidateCacheKey(sermonCacheKey(sermonId)),
  ]);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleFavorite(sermonId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: sermon, error: fetchError } = await supabase
    .from("sermons")
    .select("is_favorite")
    .eq("id", sermonId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !sermon) {
    return { error: "Sermon not found" };
  }

  const { error } = await supabase
    .from("sermons")
    .update({ is_favorite: !sermon.is_favorite })
    .eq("id", sermonId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  await Promise.all([
    invalidateUserSermonCache(user.id),
    invalidateCacheKey(sermonCacheKey(sermonId)),
  ]);
  revalidatePath("/", "layout");
  return { success: true, isFavorite: !sermon.is_favorite };
}
