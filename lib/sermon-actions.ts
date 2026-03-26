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
