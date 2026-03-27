import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InlineVerseView } from './inline-verse-view';

export const InlineVerse = Node.create({
  name: 'inlineVerse',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      reference: {
        default: '',
      },
      text: {
        default: '',
      },
      version: {
        default: 'NVI',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-verse"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-verse' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineVerseView)
  },
});
