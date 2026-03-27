import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicSermonViewer } from "@/components/shared/public-sermon-viewer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sermon } = await supabase
    .from("sermons")
    .select("title, main_scripture")
    .eq("slug", slug)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single();

  if (!sermon) {
    return { title: "Sermon Not Found" };
  }

  return {
    title: `${sermon.title} — Open Sermon`,
    description: sermon.main_scripture
      ? `A sermon on ${sermon.main_scripture}`
      : `A shared sermon: ${sermon.title}`,
  };
}

export default async function PublicSermonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sermon, error } = await supabase
    .from("sermons")
    .select("title, blocks, main_scripture, type, status, preached_at, created_at")
    .eq("slug", slug)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single();

  if (error || !sermon) {
    notFound();
  }

  return (
    <PublicSermonViewer
      title={sermon.title}
      blocks={sermon.blocks}
      mainScripture={sermon.main_scripture}
      type={sermon.type}
      preachedAt={sermon.preached_at}
    />
  );
}
