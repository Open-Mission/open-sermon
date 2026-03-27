import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { VerseBlockView } from './verse-block-view'

export const VerseBlock = Node.create({
  name: 'verseBlock',
  group: 'block',
  content: 'block+',
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { 'data-id': attributes.id };
        },
      },
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
    return [{ tag: 'div[data-type="verse"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'verse' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VerseBlockView)
  },
})