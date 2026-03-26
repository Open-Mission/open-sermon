import { notFound } from "next/navigation";
import { SermonEditor } from "@/components/editor/sermon-editor";
import { createClient } from "@/lib/supabase/client";

export default async function SermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch sermon data on server side
  const supabase = createClient(); // This is now the browser client
  const { data: sermon } = await supabase
    .from("sermons")
    .select("*")
    .eq("id", id)
    .single();

  if (!sermon) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{sermon.title}</h1>
        <div className="text-sm text-muted-foreground italic uppercase">
          {sermon.status}
        </div>
      </div>

      <SermonEditor initialContent={sermon.blocks || null} sermonId={id} />
    </div>
  );
}
