"use client";

import * as React from "react";
import { Editor } from "@tiptap/react";
import { 
  List, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export type TocItem = {
  id: string;
  level: number;
  nodeType: string;
  pos: number;
  title: string;
};

interface TableOfContentsProps {
  editor: Editor | null;
}

export function TableOfContents({ editor }: TableOfContentsProps) {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = React.useState<string | null>(null);
  const [isTocSheetOpen, setIsTocSheetOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const tocItemsRef = React.useRef<TocItem[]>([]);
  const t = useTranslations("editor");

  const getTocFallbackLabel = React.useCallback((nodeType: string, level: number) => {
    if (nodeType === "heading") {
      const normalizedLevel = Math.min(Math.max(level, 1), 3);
      return t(`blocks.h${normalizedLevel}` as "blocks.h1" | "blocks.h2" | "blocks.h3");
    }

    const map: Record<string, string> = {
      introBlock: t("blocks.intro"),
      pointBlock: t("blocks.point"),
      illustrationBlock: t("blocks.illustration"),
      applicationBlock: t("blocks.application"),
      conclusionBlock: t("blocks.conclusion"),
      verseBlock: t("blocks.verse"),
    };

    return map[nodeType] ?? t("blocks.text");
  }, [t]);

  const collectTocItems = React.useCallback(() => {
    const items: TocItem[] = [];
    const indexedNodeTypes = new Set([
      "heading",
      "introBlock",
      "pointBlock",
      "illustrationBlock",
      "applicationBlock",
      "conclusionBlock",
      "verseBlock",
    ]);

    if (!editor) {
      return items;
    }

    editor.state.doc.descendants((node, pos) => {
      if (!indexedNodeTypes.has(node.type.name)) {
        return;
      }

      const level = node.type.name === "heading" ? Number(node.attrs.level ?? 1) : 2;
      const normalizedText = node.textContent.replace(/\s+/g, " ").trim();
      const title = normalizedText || getTocFallbackLabel(node.type.name, level);
      const itemId = typeof node.attrs.id === "string" ? node.attrs.id : `${node.type.name}-${pos}`;

      items.push({
        id: itemId,
        level,
        nodeType: node.type.name,
        pos,
        title,
      });
    });

    return items;
  }, [editor, getTocFallbackLabel]);

  const areTocItemsEqual = React.useCallback((a: TocItem[], b: TocItem[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].id !== b[i].id ||
        a[i].level !== b[i].level ||
        a[i].nodeType !== b[i].nodeType ||
        a[i].pos !== b[i].pos ||
        a[i].title !== b[i].title
      ) return false;
    }
    return true;
  }, []);

  const updateToc = React.useCallback(() => {
    const items = collectTocItems();
    tocItemsRef.current = items;

    setTocItems((prev) => {
      if (areTocItemsEqual(prev, items)) return prev;
      return items;
    });

    return items;
  }, [areTocItemsEqual, collectTocItems]);

  const findActiveTocId = React.useCallback((items: TocItem[]) => {
    if (!editor || items.length === 0) return null;

    const cursorPosition = editor.state.selection.from;
    let active = items[0];

    for (const item of items) {
      if (item.pos <= cursorPosition) {
        active = item;
      } else {
        break;
      }
    }

    return active.id;
  }, [editor]);

  const syncActiveToc = React.useCallback((items?: TocItem[]) => {
    const source = items ?? tocItemsRef.current;
    const nextActiveId = findActiveTocId(source);

    setActiveTocId((curr) => {
      if (curr === nextActiveId) return curr;
      return nextActiveId;
    });
  }, [findActiveTocId]);

  const jumpToTocItem = React.useCallback((item: TocItem) => {
    if (!editor) return;

    const targetPosition = Math.min(item.pos + 1, editor.state.doc.content.size);
    editor.chain().focus().setTextSelection(targetPosition).scrollIntoView().run();
    setActiveTocId(item.id);
  }, [editor]);

  const goToAdjacentTocItem = React.useCallback((direction: -1 | 1) => {
    if (tocItems.length === 0) return;

    const currentIndex = tocItems.findIndex((item) => item.id === activeTocId);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = Math.min(Math.max(safeIndex + direction, 0), tocItems.length - 1);
    const nextItem = tocItems[nextIndex];

    if (nextItem) {
      jumpToTocItem(nextItem);
    }
  }, [tocItems, activeTocId, jumpToTocItem]);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const items = updateToc();
      syncActiveToc(items);
    };
    
    const handleSelectionUpdate = () => {
      syncActiveToc();
    };

    handleUpdate();

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, updateToc, syncActiveToc]);

  const activeTocIndex = tocItems.findIndex((item) => item.id === activeTocId);
  const hasPreviousTocItem = activeTocIndex > 0;
  const hasNextTocItem = activeTocIndex !== -1 && activeTocIndex < tocItems.length - 1;

  if (!editor || tocItems.length === 0) return null;

  const renderTocItem = (item: TocItem, index: number, onSelect: (selectedItem: TocItem) => void) => {
    const isActive = item.id === activeTocId;
    const baseLevel = item.nodeType === "heading" ? item.level : 2;

    return (
      <button
        key={`${item.id}-${index}`}
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          "group relative flex w-full items-center rounded-lg px-2 py-1.5 text-left transition-all duration-200",
          baseLevel >= 2 && "pl-4",
          baseLevel >= 3 && "pl-6",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "mr-2 h-1 w-1 shrink-0 rounded-full transition-colors",
            isActive ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60",
          )}
        />
        <span className="line-clamp-1 text-xs">{item.title}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Floating Button & Sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed right-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur-sm"
          onClick={() => setIsTocSheetOpen(true)}
        >
          <List className="h-5 w-5" />
        </button>
        <Sheet open={isTocSheetOpen} onOpenChange={setIsTocSheetOpen}>
          <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
            <SheetHeader className="border-b border-border/60 p-4">
              <SheetTitle>{t("toc.title")}</SheetTitle>
              <SheetDescription>{t("toc.description")}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full bg-background">
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Navegação
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => goToAdjacentTocItem(-1)}
                    disabled={!hasPreviousTocItem}
                    className="p-1 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToAdjacentTocItem(1)}
                    disabled={!hasNextTocItem}
                    className="p-1 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
                {tocItems.map((item, index) => renderTocItem(item, index, (it) => {
                  jumpToTocItem(it);
                  setIsTocSheetOpen(false);
                }))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop ToC (Sticky sidebar) */}
      <aside className="pointer-events-none fixed top-0 right-8 hidden lg:block h-full">
        <div 
          className={cn(
             "pointer-events-auto sticky top-0 right-1 flex flex-col items-end transition-all duration-300",
             isMinimized ? "w-10" : "w-64"
          )}
        >
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(false)}
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm transition-all duration-200"
              title="Expandir Table of Contents"
            >
               <List className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-full flex flex-col rounded-xl border border-border/50 bg-background/95 shadow-xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">
                    {t("toc.title")}
                  </span>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"
                  title="Minimizar"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>

              <div className="px-3 py-1.5 border-b border-border/40 flex items-center justify-between bg-muted/10">
                 <div className="flex items-center gap-1.5">
                   <button
                    type="button"
                    onClick={() => goToAdjacentTocItem(-1)}
                    disabled={!hasPreviousTocItem}
                    className="p-1 hover:bg-background rounded disabled:opacity-20 transition-all border border-transparent hover:border-border/40"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToAdjacentTocItem(1)}
                    disabled={!hasNextTocItem}
                    className="p-1 hover:bg-background rounded disabled:opacity-20 transition-all border border-transparent hover:border-border/40"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                 </div>
                 <span className="text-[10px] text-muted-foreground font-semibold">
                   {activeTocIndex + 1} / {tocItems.length}
                 </span>
              </div>

              <div className="max-h-[65vh] overflow-y-auto px-1.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20">
                {tocItems.map((item, index) => renderTocItem(item, index, jumpToTocItem))}
              </div>
              
              <div className="p-2 border-t border-border/40 bg-muted/5 rounded-b-xl">
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest px-1">
                   <List className="h-3 w-3" />
                   <span>{t("toc.title")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
