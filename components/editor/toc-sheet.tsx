"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { GripVertical, List } from "lucide-react";
import { useEditorContext } from "./editor-context";

export type TocItem = {
  id: string;
  level: number;
  nodeType: string;
  pos: number;
  title: string;
  nodeSize: number;
};

const INDEXED_NODE_TYPES = new Set([
  "heading",
  "paragraph",
  "introBlock",
  "pointBlock",
  "illustrationBlock",
  "applicationBlock",
  "conclusionBlock",
  "verseBlock",
  "calloutBlock",
]);

interface SortableTocItemProps {
  item: TocItem;
  isActive: boolean;
  onSelect: (item: TocItem) => void;
}

function SortableTocItem({ item, isActive, onSelect }: SortableTocItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const baseLevel = item.nodeType === "heading" ? item.level : 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex w-full items-center rounded-lg transition-all duration-200",
        baseLevel >= 2 && "pl-2",
        baseLevel >= 3 && "pl-4",
        isActive && "bg-primary/10",
        isDragging && "opacity-50 z-50 shadow-lg bg-background border border-border"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          "flex-1 flex items-center gap-2 py-2 pr-2 text-left min-w-0",
          isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            isActive ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
          )}
        />
        <span className="line-clamp-1 text-sm truncate">{item.title}</span>
      </button>
    </div>
  );
}

export function TocSheet() {
  const { editor } = useEditorContext();
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const t = useTranslations("editor");
  const tocItemsRef = React.useRef<TocItem[]>([]);

  const getBlockLabel = React.useCallback(
    (nodeType: string, level: number) => {
      if (nodeType === "heading") {
        const normalizedLevel = Math.min(Math.max(level, 1), 3) as 1 | 2 | 3;
        return t(`blocks.h${normalizedLevel}`);
      }
      if (nodeType === "paragraph") {
        return t("blocks.text");
      }

      const map: Record<string, string> = {
        introBlock: t("blocks.intro"),
        pointBlock: t("blocks.point"),
        illustrationBlock: t("blocks.illustration"),
        applicationBlock: t("blocks.application"),
        conclusionBlock: t("blocks.conclusion"),
        verseBlock: t("blocks.verse"),
        calloutBlock: t("blocks.callout"),
      };

      return map[nodeType] ?? t("blocks.text");
    },
    [t]
  );

  const collectTocItems = React.useCallback(() => {
    const items: TocItem[] = [];

    if (!editor) {
      return items;
    }

    editor.state.doc.descendants((node, pos) => {
      if (!INDEXED_NODE_TYPES.has(node.type.name)) {
        return;
      }

      if (node.type.name === "paragraph" && node.textContent.trim() === "") {
        return;
      }

      const level = node.type.name === "heading" ? Number(node.attrs.level ?? 1) : 2;
      const normalizedText = node.textContent.replace(/\s+/g, " ").trim();
      const title = normalizedText || getBlockLabel(node.type.name, level);
      const itemId = typeof node.attrs.id === "string" ? node.attrs.id : `${node.type.name}-${pos}`;

      items.push({
        id: itemId,
        level,
        nodeType: node.type.name,
        pos,
        title,
        nodeSize: node.nodeSize,
      });
    });

    return items;
  }, [editor, getBlockLabel]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const items = collectTocItems();
      tocItemsRef.current = items;
      setTocItems(items);
    };

    const handleSelectionUpdate = () => {
      if (!editor) return;
      const items = tocItemsRef.current;
      if (items.length === 0) return;

      const cursorPosition = editor.state.selection.from;
      let active: TocItem | null = null;

      for (const item of items) {
        if (item.pos <= cursorPosition) {
          active = item;
        } else {
          break;
        }
      }

      if (active) {
        setActiveTocId(active.id);
      }
    };

    handleUpdate();

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, collectTocItems]);

  const jumpToTocItem = React.useCallback(
    (item: TocItem) => {
      if (!editor) return;

      const targetPosition = Math.min(item.pos + 1, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(targetPosition).scrollIntoView().run();
      setActiveTocId(item.id);
      if (isMobile) {
        setIsOpen(false);
      }
    },
    [editor, isMobile]
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id && editor) {
        const oldIndex = tocItems.findIndex((item) => item.id === active.id);
        const newIndex = tocItems.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const movedItem = tocItems[oldIndex];
          const targetItem = tocItems[newIndex];

          const newItems = arrayMove(tocItems, oldIndex, newIndex);
          setTocItems(newItems);
          tocItemsRef.current = newItems;

          const { tr } = editor.state;
          const $from = tr.doc.resolve(movedItem.pos);
          const $to = tr.doc.resolve(movedItem.pos + movedItem.nodeSize);
          const slice = tr.doc.slice($from.pos, $to.pos);

          tr.delete($from.pos, $to.pos);

          const insertPos = newIndex < oldIndex ? targetItem.pos : targetItem.pos;
          tr.insert(insertPos, slice.content);

          editor.view.dispatch(tr);
        }
      }
    },
    [tocItems, editor]
  );

  if (!editor) {
    return null;
  }

  const content = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tocItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5 py-2">
          {tocItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No blocks yet
            </div>
          ) : (
            tocItems.map((item) => (
              <SortableTocItem
                key={item.id}
                item={item}
                isActive={item.id === activeTocId}
                onSelect={jumpToTocItem}
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          title={t("toc.open")}
          onClick={() => setIsOpen(true)}
        >
          <List className="h-4 w-4" />
        </Button>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[95vh] max-h-[95vh]">
            <DrawerHeader className="border-b border-border/60 px-4 py-3">
              <DrawerTitle>{t("toc.title")}</DrawerTitle>
              <DrawerDescription>{t("toc.description")}</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4">{content}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="h-8 w-8"
        title={t("toc.open")}
        onClick={() => setIsOpen(true)}
      >
        <List className="h-4 w-4" />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-80 p-0" showCloseButton>
          <SheetHeader className="border-b border-border/60 px-4 py-3">
            <SheetTitle>{t("toc.title")}</SheetTitle>
            <SheetDescription>{t("toc.description")}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-3">{content}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
