"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BlockSelectionContextType = {
  selectedBlocks: string[];
  toggleBlock: (id: string) => void;
  clearSelection: () => void;
  isBlockSelected: (id: string) => boolean;
  bulkDelete: () => void;
  bulkCopy: () => void;
};

const BlockSelectionContext = createContext<BlockSelectionContextType | undefined>(undefined);

export function BlockSelectionProvider({ 
  children, 
  onDelete, 
  onCopy 
}: { 
  children: ReactNode;
  onDelete?: (ids: string[]) => void;
  onCopy?: (ids: string[]) => void;
}) {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

  const toggleBlock = (id: string) => {
    setSelectedBlocks((prev) => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedBlocks([]);

  const isBlockSelected = (id: string) => selectedBlocks.includes(id);

  const bulkDelete = () => {
    if (onDelete && selectedBlocks.length > 0) {
      onDelete(selectedBlocks);
      clearSelection();
    }
  };

  const bulkCopy = () => {
    if (onCopy && selectedBlocks.length > 0) {
      onCopy(selectedBlocks);
      clearSelection();
    }
  };

  return (
    <BlockSelectionContext.Provider value={{
      selectedBlocks,
      toggleBlock,
      clearSelection,
      isBlockSelected,
      bulkDelete,
      bulkCopy,
    }}>
      {children}
    </BlockSelectionContext.Provider>
  );
}

export function useBlockSelection() {
  const context = useContext(BlockSelectionContext);
  if (context === undefined) {
    throw new Error("useBlockSelection must be used within a BlockSelectionProvider");
  }
  return context;
}
