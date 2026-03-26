"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/", "layout");
  return { success: true };
}
