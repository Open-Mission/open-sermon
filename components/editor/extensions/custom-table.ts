"use client";

import { TableCell, TableRow as TableRowExtension, TableHeader } from "@tiptap/extension-table";

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {};
          return {
            style: `text-align: ${attributes.textAlign}`,
          };
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
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {};
          return {
            style: `text-align: ${attributes.textAlign}`,
          };
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
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});
