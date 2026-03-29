"use client";

import * as React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Trash2,
  Merge,
  Plus,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  RowsIcon,
  ColumnsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const cellColors = [
  { color: "transparent", label: "Nenhuma" },
  { color: "#f3f4f6", label: "Cinza claro" },
  { color: "#e5e7eb", label: "Cinza" },
  { color: "#d1d5db", label: "Cinza médio" },
  { color: "#fecaca", label: "Vermelho claro" },
  { color: "#fed7aa", label: "Laranja claro" },
  { color: "#fef08a", label: "Amarelo claro" },
  { color: "#bbf7d0", label: "Verde claro" },
  { color: "#a5f3fc", label: "Ciano claro" },
  { color: "#bfdbfe", label: "Azul claro" },
  { color: "#e9d5ff", label: "Roxo claro" },
];

type TableBubbleMenuProps = {
  editor: Editor | null;
};

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  if (!editor) return null;

  const currentCellAttrs = editor.getAttributes("tableCell");
  const currentBgColor = currentCellAttrs.backgroundColor || "transparent";

  const setCellBackground = (color: string) => {
    editor.chain().focus().setCellAttribute("backgroundColor", color).run();
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    editor.chain().focus().setCellAttribute("textAlign", align).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={({ editor }) => editor.isActive("table")}
      className="flex items-center gap-0.5 p-1 overflow-hidden rounded-md border border-border bg-background shadow-xl"
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium hover:bg-muted rounded-md transition-colors text-muted-foreground"
            title="Linhas"
          >
            <RowsIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Linhas</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-1" sideOffset={5}>
          <div className="flex flex-col">
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left"
            >
              <Plus className="h-4 w-4" />
              Adicionar acima
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left"
            >
              <Plus className="h-4 w-4" />
              Adicionar abaixo
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left text-destructive"
            >
              <Minus className="h-4 w-4" />
              Excluir linha
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium hover:bg-muted rounded-md transition-colors text-muted-foreground"
            title="Colunas"
          >
            <ColumnsIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Colunas</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-44 p-1" sideOffset={5}>
          <div className="flex flex-col">
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left"
            >
              <Plus className="h-4 w-4" />
              Adicionar à esquerda
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left"
            >
              <Plus className="h-4 w-4" />
              Adicionar à direita
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left text-destructive"
            >
              <Minus className="h-4 w-4" />
              Excluir coluna
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-4 bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "p-2 text-sm hover:bg-muted rounded-md transition-colors",
              currentBgColor !== "transparent" ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
            title="Cor de fundo"
          >
            <Palette className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-2" sideOffset={5}>
          <div className="text-xs font-medium text-muted-foreground mb-2">Cor de fundo</div>
          <div className="grid grid-cols-3 gap-1.5">
            {cellColors.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => setCellBackground(color)}
                className={cn(
                  "h-6 rounded-md border transition-all hover:scale-105",
                  currentBgColor === color && "ring-2 ring-primary ring-offset-1",
                  color === "transparent" ? "bg-background border-dashed" : "border-border"
                )}
                style={{ backgroundColor: color === "transparent" ? undefined : color }}
                title={label}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-2 text-sm hover:bg-muted rounded-md transition-colors text-muted-foreground"
            title="Alinhamento"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-36 p-1" sideOffset={5}>
          <div className="flex flex-col">
            <button
              onClick={() => setAlignment("left")}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                currentCellAttrs.textAlign === "left" && "bg-muted font-medium"
              )}
            >
              <AlignLeft className="h-4 w-4" />
              Esquerda
            </button>
            <button
              onClick={() => setAlignment("center")}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                currentCellAttrs.textAlign === "center" && "bg-muted font-medium"
              )}
            >
              <AlignCenter className="h-4 w-4" />
              Centro
            </button>
            <button
              onClick={() => setAlignment("right")}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-muted transition-colors text-left",
                currentCellAttrs.textAlign === "right" && "bg-muted font-medium"
              )}
            >
              <AlignRight className="h-4 w-4" />
              Direita
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <button
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        className={cn(
          "p-2 text-sm hover:bg-muted rounded-md transition-colors",
          editor.isActive("mergedCell") ? "bg-muted text-foreground" : "text-muted-foreground"
        )}
        title="Mesclar/Separar células"
      >
        <Merge className="h-4 w-4" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <button
            className="p-2 text-sm hover:bg-muted rounded-md transition-colors text-destructive"
            title="Excluir tabela"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-2" sideOffset={5}>
          <p className="text-xs text-muted-foreground mb-2">Excluir tabela inteira?</p>
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Excluir
          </Button>
        </PopoverContent>
      </Popover>
    </BubbleMenu>
  );
}
