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
import { useSidebar } from "@/components/ui/sidebar";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { GripVertical, Trash2 } from "lucide-react";

type JSONContent = {
  type: string;
  content?: Array<JSONContent>;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
};

type SermonEditorProps = {
  initialContent?: JSONContent | null;
  sermonId: string;
};

export function SermonEditor({ initialContent, sermonId }: SermonEditorProps) {
  const t = useTranslations("editor");
  const [showModal, setShowModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const { toggleSidebar } = useSidebar();

  const editor = useEditor({
    immediatelyRender: false,
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
    editorProps: {
      attributes: {
        class: "focus:outline-none max-w-none prose dark:prose-invert min-h-[500px] cursor-text", // Notion-like: no focus ring, full width, min-height
      },
      handleKeyDown: (view, event) => {
        // Toggle sidebar with Ctrl+B or Meta+B
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyB') {
          toggleSidebar();
          return true; // Preven propagation and default bold action
        }
        return false;
      },
    },
  });

  // Initialize editor with content
  useEffect(() => {
    if (editor && initialContent) {
      // Tiptap's setContent expects a valid document object with a 'type' property
      // If it's an empty array '[]' (default from our DB) or null, Tiptap will throw an error
      const isValidDoc = 
        typeof initialContent === 'object' && 
        !Array.isArray(initialContent) && 
        (initialContent as JSONContent).type === 'doc';

      if (isValidDoc) {
        editor.commands.setContent(initialContent);
      }
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
      {editor && (
        <DragHandle 
          editor={editor}
          className="flex items-center gap-0.5 px-1 py-0.5 bg-background border border-border shadow-sm rounded-md transition-opacity duration-200"
        >
          <div className="flex items-center h-6">
            <button
              type="button"
              className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing text-muted-foreground transition-colors"
              title="Arraste para mover"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded text-muted-foreground transition-colors"
              title="Excluir bloco"
              onClick={() => {
                const { state } = editor;
                const { $from } = state.selection;
                // Get the range of the current block node
                const range = { 
                  from: $from.before($from.depth || 1), 
                  to: $from.after($from.depth || 1) 
                };
                editor.chain().focus().deleteRange(range).run();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </DragHandle>
      )}
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
              ?.chain()
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
