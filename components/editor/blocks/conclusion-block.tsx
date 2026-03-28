import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ConclusionBlockView } from './conclusion-block-view'

export const ConclusionBlock = Node.create({
  name: 'conclusionBlock',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [{ tag: 'div[data-type="conclusion"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'conclusion' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ConclusionBlockView)
  },
})