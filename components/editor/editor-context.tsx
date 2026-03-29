"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

interface EditorContextValue {
  editor: Editor | null;
  setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}
