"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useState, useEffect, useCallback, useRef } from "react";
import { StarterKit } from "@tiptap/starter-kit";
import { NodeSelection } from "@tiptap/pm/state";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import UniqueId from "@tiptap/extension-unique-id";
import { Placeholder } from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
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
import { SlashCommandMenu, openSlashMenu, closeSlashMenu, updateSlashMenuQuery } from "./slash-command-menu";
import { BlockMenu, OPEN_BLOCK_MENU_EVENT } from "./block-menu";
import { CursorSlashButton } from "./cursor-slash-button";
import "./editor.css";

import { createClient } from "@/lib/supabase/client";
import { syncService } from "@/lib/sync-service";
import { offlineDb } from "@/lib/offline-db";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Trash2, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Copy, 
  X, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  ChevronDown,
  Search,
  Palette,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sermon } from "@/types/sermon";
import { BlockSelectionProvider, useBlockSelection } from "./block-selection-context";
import { SelectableTextBlockView } from "./blocks/selectable-text-block-view";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Heading } from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/react";
import { highlightColors } from "./highlight-color-picker";

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
  const isMobile = useIsMobile();
  const slashMenuOpenRef = useRef(false);
  const slashQueryRef = useRef('');
  const slashRangeRef = useRef<{ from: number; to: number } | null>(null);

  const supabase = createClient();
  const { toggleSidebar } = useSidebar();

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      if (editor.isDestroyed) return;
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
          const hasContent = editor.getText().trim().length > 0 || editor.getHTML().length > 50
          if (pos <= 1 && editor.isEmpty) {
            return "Comece a escrever sua mensagem...";
          }
          if (hasContent) {
            return "";
          }
          return "Pressione '/' para comandos";
        },
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
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
      handleTextInput: (view, from, _to, text) => {
        // Slash command trigger
        if (text === '/') {
          const coords = view.coordsAtPos(from)
          const scrollY = window.scrollY
          const scrollX = window.scrollX

          // Range will cover the '/' character once inserted
          const range = { from, to: from + 1 }
          slashRangeRef.current = range
          slashQueryRef.current = ''
          slashMenuOpenRef.current = true

          // On mobile, open the drawer-style menu
          if (isMobile) {
            window.dispatchEvent(new CustomEvent(OPEN_BLOCK_MENU_EVENT))
            return false // let the '/' actually be typed
          }

          // Desktop: open floating popover at cursor position
          setTimeout(() => {
            openSlashMenu(
              { top: coords.bottom + scrollY, left: coords.left + scrollX },
              { from, to: from + 1 }
            )
          }, 0)
          return false // let '/' be typed so user sees it
        }

        // When slash menu is open, update the query
        if (slashMenuOpenRef.current && !isMobile) {
          const newQuery = slashQueryRef.current + text
          slashQueryRef.current = newQuery
          // Update range to cover '/' + query
          if (slashRangeRef.current) {
            const newTo = slashRangeRef.current.from + 1 + newQuery.length
            slashRangeRef.current = { from: slashRangeRef.current.from, to: newTo }
            updateSlashMenuQuery(newQuery)
          }
        }
        return false
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.code === 'Backslash') {
          toggleSidebar();
          return true;
        }
        // Handle backspace to close slash menu when user deletes the '/'
        if (event.key === 'Backspace' && slashMenuOpenRef.current && !isMobile) {
          if (slashQueryRef.current.length === 0) {
            // Deleting the '/' itself — close menu
            closeSlashMenu()
            slashMenuOpenRef.current = false
            slashQueryRef.current = ''
            slashRangeRef.current = null
          } else {
            // Update query
            slashQueryRef.current = slashQueryRef.current.slice(0, -1)
            if (slashRangeRef.current) {
              slashRangeRef.current = { from: slashRangeRef.current.from, to: slashRangeRef.current.to - 1 }
            }
            updateSlashMenuQuery(slashQueryRef.current)
          }
        }
        return false;
      },
    },
  });

  // Track slash menu close to reset refs
  useEffect(() => {
    const handleClose = () => {
      slashMenuOpenRef.current = false
      slashQueryRef.current = ''
      slashRangeRef.current = null
    }
    window.addEventListener('slash-menu:close', handleClose)
    return () => window.removeEventListener('slash-menu:close', handleClose)
  }, [isMobile]);

  // Focus editor on mount for new sermons
  useEffect(() => {
    if (editor && !initialContent) {
      editor.commands.focus();
    }
  }, [editor, initialContent]);

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
        const localSermon = await offlineDb.getSermon(sermonId);
        await offlineDb.saveSermon({
          ...localSermon,
          id: sermonId,
          blocks: content,
          updated_at: new Date().toISOString(),
        } as Sermon);

        if (!navigator.onLine || offlineDb.isLocalId(sermonId)) {
          await syncService.updateSermonOffline(sermonId, {
            blocks: content,
          });
          return;
        }

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

  const setLink = useCallback((url: string) => {
    if (!editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertInlineVerse = useCallback((reference: string, text: string, version: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'inlineVerse',
      attrs: { reference, text, version }
    }).run();
  }, [editor]);

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
          .ProseMirror [data-placeholder]::before {
            content: attr(data-placeholder) !important;
            color: rgba(120, 119, 116, 0.6) !important;
            pointer-events: none !important;
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
            const isTextSelection = !(state.selection instanceof NodeSelection) && !state.selection.empty;
            // Also don't show if the selection covers only a block that shouldn't have formatting (optional, but good for UX)
            return isTextSelection;
          }}
          className="flex items-center gap-0.5 p-1 overflow-hidden rounded-md border border-border bg-background shadow-xl"
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium hover:bg-muted rounded-md transition-colors text-muted-foreground"
                title="Tipo de bloco"
              >
                {editor.isActive('heading', { level: 1 }) ? (
                  <Heading1 className="h-3.5 w-3.5" />
                ) : editor.isActive('heading', { level: 2 }) ? (
                  <Heading2 className="h-3.5 w-3.5" />
                ) : editor.isActive('heading', { level: 3 }) ? (
                  <Heading3 className="h-3.5 w-3.5" />
                ) : (
                  <Pilcrow className="h-3.5 w-3.5" />
                )}
                <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1 z-60" sideOffset={5}>
              <div className="flex flex-col">
                <button 
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                    editor.isActive('paragraph') && "bg-muted font-medium"
                  )}
                >
                  <Pilcrow className="h-4 w-4" />
                  Texto normal
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                    editor.isActive('heading', { level: 1 }) && "bg-muted font-medium"
                  )}
                >
                  <Heading1 className="h-4 w-4" />
                  Título 1
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                    editor.isActive('heading', { level: 2 }) && "bg-muted font-medium"
                  )}
                >
                  <Heading2 className="h-4 w-4" />
                  Título 2
                </button>
                <button 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                    editor.isActive('heading', { level: 3 }) && "bg-muted font-medium"
                  )}
                >
                  <Heading3 className="h-4 w-4" />
                  Título 3
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted rounded-md transition-colors",
              editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted rounded-md transition-colors",
              editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-2 text-sm hover:bg-muted rounded-md transition-colors",
              editor.isActive('underline') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
            title="Sublinhado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Quick Highlights */}
          <div className="flex items-center gap-1.5 px-1.5">
            {highlightColors.slice(0, 3).map(({ color, label }) => (
              <button
                key={color}
                onClick={() => editor.chain().focus().setHighlight({ color }).run()}
                className={cn(
                  "size-4 rounded-full border border-border shadow-xs transition-transform hover:scale-125",
                  editor.isActive('highlight', { color }) && "ring-2 ring-primary ring-offset-1"
                )}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
            <HighlightColorPicker editor={editor}>
              <button
                type="button"
                className={cn(
                  "p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors",
                  editor.isActive('highlight') && "text-foreground bg-muted"
                )}
                title="Cores personalizadas"
              >
                <Palette className="h-3.5 w-3.5" />
              </button>
            </HighlightColorPicker>
          </div>

          <div className="w-px h-4 bg-border mx-1" />

          <LinkVersePopover 
            editor={editor} 
            onSetLink={setLink}
            onInsertVerse={insertInlineVerse}
          />
          
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="p-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
            title="Limpar formatação"
          >
            <X className="h-4 w-4" />
          </button>
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
      {/* Slash command menu (desktop floating + mobile fallback) */}
      <SlashCommandMenu editor={editor} />
      {/* Cursor-following slash button */}
      <CursorSlashButton editor={editor} />
      {/* Legacy block menu for mobile FAB */}
      <BlockMenu editor={editor} />
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

function LinkVersePopover({ editor, onSetLink, onInsertVerse }: { 
  editor: Editor, 
  onSetLink: (url: string) => void,
  onInsertVerse: (ref: string, text: string, ver: string) => void 
}) {
  const [url, setUrl] = useState(editor.getAttributes('link').href || '');
  const [verseRef, setVerseRef] = useState('');
  const [version, setVersion] = useState('NVI');
  const [isLoading, setIsLoading] = useState(false);
  const [verseResult, setVerseResult] = useState<{ ref: string, text: string, version: string } | null>(null);
  const [open, setOpen] = useState(false);
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetLink(url);
    setOpen(false);
  };

  const handleVerseSearch = async () => {
    if (!verseRef.trim()) return;
    setIsLoading(true);
    setVerseResult(null);
    try {
      const resp = await fetch(`/api/bible?ref=${encodeURIComponent(verseRef)}&version=${version}`);
      if (resp.ok) {
        const data = await resp.json();
        setVerseResult({ ref: data.reference || verseRef, text: data.text, version: version });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const insertVerseAsInlineNode = () => {
    if (verseResult) {
      // For inline nodes, they usually capture the text themselves
      onInsertVerse(verseResult.ref, verseResult.text, verseResult.version);
      setOpen(false);
    }
  };

  const insertVerseAsLink = () => {
    if (verseResult) {
      // Link the selected text to a Bible website
      const searchUrl = `https://www.bibliaonline.com.br/nvi/${verseResult.ref.toLowerCase().replace(/ /g, '+')}`;
      onSetLink(searchUrl);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-2 text-sm hover:bg-muted rounded-md transition-colors border-l border-border ml-1",
            editor.isActive('link') || editor.isActive('inlineVerse') ? 'bg-muted text-foreground' : 'text-muted-foreground'
          )}
          title="Link ou Versículo"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-84 p-0 shadow-2xl border-border/50 backdrop-blur-xl bg-background/95" align="start" sideOffset={10}>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-t-lg border-b bg-muted/30">
            <TabsTrigger value="link" className="text-[10px] uppercase font-bold py-2">Link Externo</TabsTrigger>
            <TabsTrigger value="verse" className="text-[10px] uppercase font-bold py-2">Versículo Bíblico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider underline underline-offset-4 decoration-primary/30">URL de Destino</Label>
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <Input 
                  id="url"
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://exemplo.com" 
                  className="h-9 bg-muted/20 border-border/50 focus:border-primary/50 text-sm"
                  autoFocus
                />
                <Button size="sm" type="submit" className="h-9 px-4 shrink-0 shadow-sm shadow-primary/20">OK</Button>
              </form>
            </div>
            {editor.isActive('link') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { onSetLink(''); setOpen(false); }}
                className="w-full text-[10px] text-destructive hover:text-destructive hover:bg-destructive/5 uppercase font-bold"
              >
                Remover Link Atual
              </Button>
            )}
          </TabsContent>

          <TabsContent value="verse" className="p-4 space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="verse" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Referência</Label>
                <Input 
                  id="verse"
                  value={verseRef} 
                  onChange={(e) => setVerseRef(e.target.value)} 
                  placeholder="Ex: João 3:16" 
                  className="h-9 bg-muted/20 border-border/50 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerseSearch()}
                />
              </div>
              <div className="w-20 space-y-2">
                 <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Versão</Label>
                 <select 
                   value={version} 
                   onChange={(e) => setVersion(e.target.value)}
                   className="w-full h-9 rounded-md border border-border/50 bg-muted/20 text-[11px] px-2 outline-none focus:ring-1 ring-primary/50"
                 >
                   <option value="NVI">NVI</option>
                   <option value="NVT">NVT</option>
                   <option value="ARA">ARA</option>
                   <option value="ACF">ACF</option>
                 </select>
              </div>
              <Button size="icon" variant="secondary" className="h-9 w-9 shrink-0 shadow-sm" onClick={handleVerseSearch} disabled={isLoading}>
                {isLoading ? <span className="animate-spin text-xs">...</span> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {verseResult && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative p-3 rounded-lg bg-primary/5 border border-primary/10 overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-20"><BookOpen className="h-8 w-8" /></div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground italic mb-2 line-clamp-3">&quot;{verseResult.text}&quot;</p>
                  <p className="text-[10px] font-bold text-primary">{verseResult.ref} ({verseResult.version})</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] uppercase font-bold bg-background/50"
                    onClick={insertVerseAsLink}
                  >
                    Linkar Texto
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 text-[10px] uppercase font-bold shadow-sm shadow-primary/20"
                    onClick={insertVerseAsInlineNode}
                  >
                    Inserir Bloco
                  </Button>
                </div>
                <p className="text-[9px] text-center text-muted-foreground/60 leading-tight">
                  &quot;Linkar&quot; manterá o seu texto atual.<br/>&quot;Inserir&quot; substituirá pela referência.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
