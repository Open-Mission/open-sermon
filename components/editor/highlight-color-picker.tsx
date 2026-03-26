"use client";

import * as React from "react";
import { Editor } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const highlightColors = [
  { color: "var(--highlight-yellow)", label: "Amarelo" },
  { color: "var(--highlight-green)", label: "Verde" },
  { color: "var(--highlight-blue)", label: "Azul" },
  { color: "var(--highlight-pink)", label: "Rosa" },
  { color: "var(--highlight-orange)", label: "Laranja" },
  { color: "var(--highlight-purple)", label: "Roxo" },
];

type HighlightColorPickerProps = {
  editor: Editor | null;
  children: React.ReactNode;
};

export function HighlightColorPicker({ editor, children }: HighlightColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  if (!editor) return null;

  const currentHighlight = editor.getAttributes("highlight").color;

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setOpen(false);
  };

  const removeHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {highlightColors.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              onClick={() => setHighlight(color)}
              className={cn(
                "size-6 rounded-md border transition-transform hover:scale-110",
                currentHighlight === color && "ring-2 ring-foreground ring-offset-1"
              )}
              style={{ backgroundColor: color }}
              title={label}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={removeHighlight}
          className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Remover destaque
        </button>
      </PopoverContent>
    </Popover>
  );
}
