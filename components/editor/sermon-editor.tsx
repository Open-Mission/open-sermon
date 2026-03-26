"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useEffect, useCallback } from "react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { IllustrationBlock } from "./blocks/illustration-block";
import { ApplicationBlock } from "./blocks/application-block";
import { PointBlock } from "./blocks/point-block";
import { IntroBlock } from "./blocks/intro-block";
import { ConclusionBlock } from "./blocks/conclusion-block";
import { VerseBlock } from "./blocks/verse-block";
import { VerseSearchModal } from "./modals/verse-search-modal";
import { BlockMenu } from "./block-menu";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type JSONContent = {
  type: string;
  content?: Array<JSONContent>;
  attrs?: Record<string, any>;
  [key: string]: any;
};

type SermonEditorProps = {
  initialContent?: JSONContent | null;
  sermonId: string;
};

export function SermonEditor({ initialContent, sermonId }: SermonEditorProps) {
  const t = useTranslations("components.editor.sermonEditor");
  const [showModal, setShowModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  const editor = useEditor({
    editable: true,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      // Debounce saving to avoid too many requests
      if (editor.isDestroyed) return;

      // Save to Supabase
      saveToSupabase(content);
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("placeholder", {
          default: "Digite '/' para inserir um bloco...",
        }),
      }),
      IllustrationBlock,
      ApplicationBlock,
      PointBlock,
      IntroBlock,
      ConclusionBlock,
      VerseBlock,
    ],
  });

  // Initialize editor with content
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const saveToSupabase = useCallback(
    async (content: JSONContent) => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        await supabase
          .from("sermons")
          .update({ blocks: content })
          .eq("id", sermonId);
      } catch (error) {
        console.error("Failed to save sermon:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [sermonId, isSaving, supabase],
  );

  return (
    <div className="relative min-h-[300px]">
      <EditorContent editor={editor} className="min-h-[300px]" />
      <BlockMenu editor={editor} />
      {showModal && selectedBlock === "verse" && (
        <VerseSearchModal
          onClose={() => {
            setShowModal(false);
            setSelectedBlock(null);
          }}
          onInsert={(reference, text, version) => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "verseBlock",
                attrs: { reference, text, version },
              })
              .run();
            setShowModal(false);
            setSelectedBlock(null);
          }}
        />
      )}
      {isSaving && (
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-primary/90 text-primary-foreground text-xs rounded">
          Salvando...
        </div>
      )}
    </div>
  );
}
