import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ApplicationBlockView } from './application-block-view'

export const ApplicationBlock = Node.create({
  name: 'applicationBlock',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="application"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'application' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ApplicationBlockView)
  },
})