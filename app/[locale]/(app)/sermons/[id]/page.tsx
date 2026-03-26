import { notFound } from "next/navigation";
import { SermonEditor } from "@/components/editor/sermon-editor";
import { createClient } from "@/lib/supabase/server";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share01Icon } from "@hugeicons/core-free-icons";
import { SaveIndicator } from "@/components/editor/save-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { SermonActionsDropdown } from "@/components/shared/sermon-actions-dropdown";

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
    .single();

  if (error || !sermon) {
    console.error("SermonPage error:", error, "ID:", id);
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Notion-style Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b border-transparent hover:border-border transition-colors group">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
          <nav className="flex items-center text-sm font-medium text-muted-foreground overflow-hidden">
            <span className="truncate max-w-[200px]">{sermon.title}</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-1">
          <SaveIndicator />
          <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
            <FavoriteButton
              sermonId={sermon.id}
              initialIsFavorite={sermon.is_favorite ?? false}
            />
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground">
              <HugeiconsIcon icon={Share01Icon} size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <SermonActionsDropdown
              sermonId={sermon.id}
              sermonTitle={sermon.title}
            />
          </div>
        </div>
      </header>

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
