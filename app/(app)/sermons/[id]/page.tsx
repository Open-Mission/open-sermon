import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SermonEditorWrapper } from "@/components/editor/sermon-editor-wrapper";

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: sermon, error } = await supabase
    .from("sermons")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !sermon) {
    console.error("SermonPage error:", error, "ID:", id);
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SermonEditorWrapper
        sermon={{
          id: sermon.id,
          title: sermon.title,
          description: sermon.description,
          status: sermon.status,
          is_favorite: sermon.is_favorite,
          is_public: sermon.is_public,
          slug: sermon.slug,
          blocks: sermon.blocks,
          type: sermon.type,
          preached_at: sermon.preached_at,
          tags: sermon.tags ?? [],
        }}
      />
    </div>
  );
}
