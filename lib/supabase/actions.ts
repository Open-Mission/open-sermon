"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = {
  error?: string;
};

export async function signIn(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "pt-BR";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${locale}`);
}

export async function signUp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: undefined };
}

export async function signInWithMagicLink(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const origin = formData.get("origin") as string;
  const locale = (formData.get("locale") as string) || "pt-BR";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/${locale}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: undefined };
}

export async function signInWithGoogle(locale: string = "pt-BR") {
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/${locale}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Could not initiate Google sign in" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
