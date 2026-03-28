import { notFound } from "next/navigation";
import { SermonEditor } from "@/components/editor/sermon-editor";
import { createClient } from "@/lib/supabase/server";
import { SaveIndicator } from "@/components/editor/save-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ShareButton } from "@/components/shared/share-button";
import { SermonActionsDropdown } from "@/components/shared/sermon-actions-dropdown";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";
import { SermonPageHeader } from "@/components/shared/sermon-page-header";

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  // Fetch sermon data on server side
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
      {/* Notion-style Header */}
      <SermonPageHeader>
        <div className="flex items-center gap-1">
          <SyncStatusIndicator />
          <SaveIndicator />
          <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
            <FavoriteButton
              sermonId={sermon.id}
              initialIsFavorite={sermon.is_favorite ?? false}
            />
            <ShareButton
              sermonId={sermon.id}
              sermonTitle={sermon.title}
              isPublic={sermon.is_public ?? false}
              slug={sermon.slug}
            />
            <SermonActionsDropdown
              sermonId={sermon.id}
              sermonTitle={sermon.title}
            />
          </div>
        </div>
      </SermonPageHeader>

      {/* Page Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:px-16 lg:px-24">
        {/* Title area like Notion */}
        <div className="mb-8 group/title">
          <div className="text-sm text-muted-foreground italic uppercase tracking-widest mb-4 opacity-50 group-hover/title:opacity-100 transition-opacity">
            {sermon.status}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 outline-none">
            {sermon.title}
          </h1>
        </div>

        <SermonEditor initialContent={sermon.blocks || null} sermonId={id} />
      </div>
    </div>
  );
}
