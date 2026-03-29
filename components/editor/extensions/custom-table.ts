"use client";

import { Table, TableCell, TableRow as TableRowExtension, TableHeader } from "@tiptap/extension-table";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableView } from "./table-view";

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6) return null;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getTextColor(bgColor: string | null): string {
  if (!bgColor || bgColor === "transparent") {
    return "inherit";
  }
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? "#1f2937" : "#f9fafb";
}

function buildStyle(attributes: Record<string, unknown>, existingStyle?: string): string {
  const styles: string[] = [];
  if (existingStyle) styles.push(existingStyle);
  
  const bgColor = attributes.backgroundColor as string | null;
  if (bgColor && bgColor !== "transparent") {
    styles.push(`background-color: ${bgColor}`);
    styles.push(`color: ${getTextColor(bgColor)}`);
  }
  
  const textAlign = attributes.textAlign as string | null;
  if (textAlign) {
    styles.push(`text-align: ${textAlign}`);
  }
  
  return styles.join("; ");
}

export const CustomTable = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableView);
  },
});

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          const style = buildStyle(attributes);
          if (!style) return {};
          return { style };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign && !attributes.backgroundColor) return {};
          const style = buildStyle(attributes);
          return { style };
        },
      },
    };
  },
});

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          const style = buildStyle(attributes);
          if (!style) return {};
          return { style };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign && !attributes.backgroundColor) return {};
          const style = buildStyle(attributes);
          return { style };
        },
      },
    };
  },
});

export const CustomTableRow = TableRowExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          const style = buildStyle(attributes);
          if (!style) return {};
          return { style };
        },
      },
    };
  },
});
