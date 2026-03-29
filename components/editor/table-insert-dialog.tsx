"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

type TableInsertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
};

const MAX_ROWS = 10;
const MAX_COLS = 10;

export function TableInsertDialog({ open, onOpenChange, editor }: TableInsertDialogProps) {
  const [selectedRows, setSelectedRows] = React.useState(3);
  const [selectedCols, setSelectedCols] = React.useState(3);
  const [hoveredCell, setHoveredCell] = React.useState<{ row: number; col: number } | null>(null);

  const handleInsert = () => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .insertTable({ rows: selectedRows, cols: selectedCols, withHeaderRow: true })
      .run();
    
    onOpenChange(false);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedRows(3);
    setSelectedCols(3);
    setHoveredCell(null);
  };

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedRows(row);
    setSelectedCols(col);
  };

  const displayRows = hoveredCell?.row ?? selectedRows;
  const displayCols = hoveredCell?.col ?? selectedCols;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetSelection(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Inserir Tabela</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-1 mb-4" 
            style={{ 
              gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`,
            }}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {Array.from({ length: MAX_ROWS }).map((_, rowIdx) =>
              Array.from({ length: MAX_COLS }).map((_, colIdx) => {
                const row = rowIdx + 1;
                const col = colIdx + 1;
                const isActive = row <= displayRows && col <= displayCols;
                const isSelected = row === displayRows && col === displayCols;
                
                return (
                  <button
                    key={`${row}-${col}`}
                    className={cn(
                      "aspect-square rounded-sm border transition-colors",
                      isActive 
                        ? "bg-primary border-primary" 
                        : "bg-muted/50 border-border hover:bg-muted",
                      isSelected && "ring-2 ring-primary ring-offset-1"
                    )}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={() => handleCellClick(row, col)}
                  />
                );
              })
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground mb-4">
            {displayRows} × {displayCols} {displayRows === 1 ? "linha" : "linhas"} × {displayCols === 1 ? "coluna" : "colunas"}
            {displayRows > 1 && " (com cabeçalho)"}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => resetSelection()}>
              Resetar
            </Button>
            <Button className="flex-1" onClick={handleInsert}>
              Inserir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const TABLE_INSERT_DIALOG_EVENT = "table-insert-dialog:open";

export function openTableInsertDialog() {
  window.dispatchEvent(new CustomEvent(TABLE_INSERT_DIALOG_EVENT));
}
