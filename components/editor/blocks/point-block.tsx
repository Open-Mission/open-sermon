import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { PointBlockView } from './point-block-view'

export const PointBlock = Node.create({
  name: 'pointBlock',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [{ tag: 'div[data-type="point"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'point' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(PointBlockView)
  },
})