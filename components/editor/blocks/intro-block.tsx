import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { IntroBlockView } from './intro-block-view'

export const IntroBlock = Node.create({
  name: 'introBlock',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="intro"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'intro' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(IntroBlockView)
  },
})