"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import * as React from "react";

export function TableView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper className="tableWrapper">
      <table>
        <NodeViewContent />
      </table>
    </NodeViewWrapper>
  );
}
