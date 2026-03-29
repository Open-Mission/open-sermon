"use client";

import * as React from "react";
import { SermonEditor } from "@/components/editor/sermon-editor";
import { EditorProvider } from "@/components/editor/editor-context";
import { TocSheet } from "@/components/editor/toc-sheet";
import { SermonPageHeader } from "@/components/shared/sermon-page-header";
import { SaveIndicator } from "@/components/editor/save-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ShareButton } from "@/components/shared/share-button";
import { SermonActionsDropdown } from "@/components/shared/sermon-actions-dropdown";
import { SyncStatusIndicator } from "@/components/shared/sync-status-indicator";
import type { SermonType } from "@/lib/sermon-actions";

type JSONContent = {
  type: string;
  content?: Array<JSONContent>;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
};

interface SermonEditorWrapperProps {
  sermon: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    is_favorite: boolean | null;
    is_public: boolean | null;
    slug: string | null;
    blocks: JSONContent | null;
    type: string;
    preached_at: string | null;
    tags: string[];
  };
}

export function SermonEditorWrapper({ sermon }: SermonEditorWrapperProps) {
  return (
    <EditorProvider>
      <SermonPageHeader>
        <div className="flex items-center gap-1">
          <TocTriggerButton />
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
              sermonDescription={sermon.description ?? ""}
              sermonType={sermon.type as SermonType}
              sermonPreachedAt={sermon.preached_at}
              sermonTags={sermon.tags ?? []}
            />
          </div>
        </div>
      </SermonPageHeader>

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:px-16 lg:px-24">
        <div className="mb-8 group/title">
          <div className="text-sm text-muted-foreground italic uppercase tracking-widest mb-4 opacity-50 group-hover/title:opacity-100 transition-opacity">
            {sermon.status}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 outline-none">
            {sermon.title}
          </h1>
        </div>

        <SermonEditor initialContent={sermon.blocks || null} sermonId={sermon.id} />
      </div>

      <TocSheet />
    </EditorProvider>
  );
}

function TocTriggerButton() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <TocSheet />;
}
