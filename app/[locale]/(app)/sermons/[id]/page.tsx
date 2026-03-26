import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function SermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sermon } = await supabase
    .from("sermons")
    .select("*")
    .eq("id", id)
    .single();

  if (!sermon) {
    notFound();
  }

// removed t
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{sermon.title}</h1>
        <div className="text-sm text-muted-foreground italic uppercase">
          {sermon.status}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 min-h-[400px]">
        <p className="text-muted-foreground italic">Editor will be here...</p>
      </div>
    </div>
  );
}
