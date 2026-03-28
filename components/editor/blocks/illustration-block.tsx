import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { IllustrationBlockView } from './illustration-block-view'

export const IllustrationBlock = Node.create({
  name: 'illustrationBlock',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [{ tag: 'div[data-type="illustration"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'illustration' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(IllustrationBlockView)
  },
})