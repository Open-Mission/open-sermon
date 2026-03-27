"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useState, useEffect, useCallback } from "react";
import { StarterKit } from "@tiptap/starter-kit";
import { NodeSelection } from "@tiptap/pm/state";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import UniqueId from "@tiptap/extension-unique-id";
import { Placeholder } from "@tiptap/extension-placeholder";
import { IllustrationBlock } from "./blocks/illustration-block";
import { ApplicationBlock } from "./blocks/application-block";
import { PointBlock } from "./blocks/point-block";
import { IntroBlock } from "./blocks/intro-block";
import { ConclusionBlock } from "./blocks/conclusion-block";
import { VerseBlock } from "./blocks/verse-block";
import { CalloutBlock } from "./blocks/callout-block";
import { InlineVerse } from "./blocks/inline-verse";
import { VerseSearchModal } from "./modals/verse-search-modal";
import { HighlightColorPicker } from "./highlight-color-picker";
import { BlockMenu } from "./block-menu";


import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { Trash2, Bold, Italic, Underline as UnderlineIcon, Copy, X, Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockSelectionProvider, useBlockSelection } from "./block-selection-context";
import { SelectableTextBlockView } from "./blocks/selectable-text-block-view";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";

const SelectableParagraph = Paragraph.extend({
  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(SelectableTextBlockView as any);
  },
});

const SelectableHeading = Heading.extend({
  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(SelectableTextBlockView as any);
  },
});
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
      StarterKit.configure({
        paragraph: false,
        heading: false,
      }),
      SelectableParagraph,
      SelectableHeading,
      Placeholder.configure({
        placeholder: ({ editor, pos }) => {
          if (pos <= 1 && editor.isEmpty) {
            return "Comece a escrever sua mensagem...";
          }
          return "Pressione '/' para comandos";
        },
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        showOnlyCurrent: false,
      }),
      CalloutBlock,
      IllustrationBlock,
      ApplicationBlock,
      PointBlock,
      IntroBlock,
      ConclusionBlock,
      VerseBlock,
      InlineVerse,
      Underline,
      Highlight.configure({ multicolor: true }),
      UniqueId.configure({
        types: ['paragraph', 'heading', 'verseBlock', 'calloutBlock', 'illustrationBlock', 'applicationBlock', 'pointBlock', 'introBlock', 'conclusionBlock'],
        generateID: () => crypto.randomUUID(),
      }),
    ],
    editorProps: {
      attributes: {
        class: "ProseMirror focus:outline-none max-w-none prose dark:prose-invert min-h-[500px] cursor-text",
      },
      handleKeyDown: (view, event) => {
        // Toggle sidebar with Ctrl+\ or Meta+\
        if ((event.ctrlKey || event.metaKey) && event.code === 'Backslash') {
          toggleSidebar();
          return true; // Prevent propagation and default bold action
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

  // Dispatch saving event for global SaveIndicator
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sermon-save-status', { detail: { isSaving } }));
  }, [isSaving]);

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

  const handleBulkDelete = (ids: string[]) => {
    if (!editor) return;
    
    // Reverse order deletion to avoid RangeError (shifting positions)
    const nodesToDelete: { pos: number; size: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.attrs.id && ids.includes(node.attrs.id)) {
        nodesToDelete.push({ pos, size: node.nodeSize });
      }
    });

    nodesToDelete.reverse().forEach(({ pos, size }) => {
      editor.view.dispatch(editor.state.tr.delete(pos, pos + size));
    });
  };

  const handleBulkCopy = (ids: string[]) => {
    if (!editor) return;
    
    const htmlContents: string[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.attrs.id && ids.includes(node.attrs.id)) {
        const dom = editor.view.nodeDOM(pos) as HTMLElement;
        if (dom) {
          htmlContents.push(dom.innerText || dom.textContent || "");
        }
      }
    });

    if (htmlContents.length > 0) {
      navigator.clipboard.writeText(htmlContents.join("\\n\\n")).then(() => {
        // simple feedback
      });
    }
  };

  useEffect(() => {
    if (!editor) return;
  }, [editor]);

  return (
    <BlockSelectionProvider onDelete={handleBulkDelete} onCopy={handleBulkCopy}>
      <div className="relative min-h-[300px]">
        <style dangerouslySetInnerHTML={{__html: `
          .my-drag-handle {
            width: 100%;
            pointer-events: none;
          }
          .my-drag-handle-inner {
            pointer-events: auto;
            position: absolute;
            right: -24px;
            top: 0;
          }
          @media (max-width: 640px) {
            .my-drag-handle-inner {
              right: 0px;
            }
          }
          
          /* Notion-style placeholder */
          .ProseMirror p.is-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: rgba(120, 119, 116, 0.6);
            pointer-events: none;
            font-style: normal;
          }
        `}} />
        <BlockSelectionToolbar />
        {/* {editor && (
        <DragHandle 
          editor={editor}
          className="my-drag-handle"
        >
          <div className="my-drag-handle-inner flex items-center h-6">
            <button
              type="button"
              className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing text-muted-foreground transition-colors bg-background border border-border shadow-sm"
              title="Arraste para mover"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </DragHandle>
      )} */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          pluginKey="formatMenu"
          shouldShow={({ state }) => {
            // Only show format menu for text selections, not node selections
            return !(state.selection instanceof NodeSelection) && !state.selection.empty;
          }}
          className="flex items-center overflow-hidden rounded-md border border-border bg-background shadow-xl"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted transition-colors",
              editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted transition-colors",
              editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted transition-colors",
              editor.isActive('underline') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <HighlightColorPicker editor={editor}>
            <button
              type="button"
              className={cn(
                "p-2 text-sm hover:bg-muted transition-colors",
                editor.isActive('highlight') ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
            >
              <Highlighter className="h-4 w-4" />
            </button>
          </HighlightColorPicker>
        </BubbleMenu>
      )}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          pluginKey="deleteBlockMenu"
          options={{ placement: 'right' }}
          shouldShow={() => {
            return false;
          }}
          className="hidden md:flex items-center overflow-hidden rounded-md border border-border bg-background shadow-xl"
        >
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().deleteSelection().run();
            }}
            className="p-2 text-sm hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
            title="Excluir bloco"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="tiptap" />
      <div 
        className="h-32 w-full cursor-text" 
        onClick={() => {
          if (editor) {
            const { doc } = editor.state;
            const lastNode = doc.lastChild;
            if (lastNode && lastNode.type.name !== 'paragraph') {
               editor.chain().focus().insertContentAt(doc.content.size, { type: 'paragraph' }).run();
            } else {
               editor.commands.focus('end');
            }
          }
        }}
      />
      <BlockMenu editor={editor} />
      {/* <TableOfContents editor={editor} /> */}
      {showModal && selectedBlock === "verse" && (
        <VerseSearchModal
          onClose={() => {
            setShowModal(false);
            setSelectedBlock(null);
          }}
          onInsert={(reference, text, version) => {
            const paragraphs = text
              ? text.split('\n').map(line => {
                  const l = line.trim();
                  return l ? { type: 'paragraph', content: [{ type: 'text', text: l }] } : { type: 'paragraph' };
                })
              : [{ type: 'paragraph' }];
              
            editor
              ?.chain()
              .focus()
              .insertContent([
                {
                  type: "verseBlock",
                  attrs: { reference, text: '', version },
                  content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph' }]
                },
                { type: 'paragraph' }
              ])
              .run();
            setShowModal(false);
            setSelectedBlock(null);
          }}
        />
      )}
    </div>
    </BlockSelectionProvider>
  );
}

function BlockSelectionToolbar() {
  const { selectedBlocks, clearSelection, bulkDelete, bulkCopy } = useBlockSelection();
  
  if (selectedBlocks.length === 0) {
    return <div className="hidden" aria-hidden="true" />;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max bg-background border border-border rounded-full shadow-lg px-4 py-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
      <span className="text-sm font-medium">
        {selectedBlocks.length} bloco{selectedBlocks.length !== 1 ? 's' : ''} selecionado{selectedBlocks.length !== 1 ? 's' : ''}
      </span>
      <div className="h-4 w-px bg-border" />
      <button 
        onClick={bulkCopy}
        className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors focus:outline-none"
        title="Copiar blocos"
      >
        <Copy className="h-4 w-4" /> Copiar
      </button>
      <button 
        onClick={bulkDelete}
        className="flex items-center gap-1.5 text-sm hover:text-destructive transition-colors focus:outline-none"
        title="Excluir blocos"
      >
        <Trash2 className="h-4 w-4" /> Excluir
      </button>
      <div className="h-4 w-px bg-border" />
      <button 
        onClick={clearSelection}
        className="p-1 hover:bg-muted rounded-full transition-colors focus:outline-none"
        title="Limpar seleção"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
