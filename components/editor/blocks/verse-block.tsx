import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { VerseBlockView } from './verse-block-view'

export const VerseBlock = Node.create({
  name: 'verseBlock',
  group: 'block',
  content: '',
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
    return [{ tag: 'div[data-type="verse"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'verse' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VerseBlockView)
  },
})