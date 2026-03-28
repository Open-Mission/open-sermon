'use client'

import { NodeViewWrapper, NodeViewContent, useEditorState } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useBlockSelection } from '../block-selection-context'
import { useLongPress } from '@/hooks/use-long-press'
import type { NodeViewProps } from '@tiptap/react'

export function SelectableTextBlockView({ node, editor }: NodeViewProps) {
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id as string | undefined
  const isSelected = blockId ? isBlockSelected(blockId) : false
  const Tag = node.type.name === 'heading' ? (`h${node.attrs.level || 1}` as 'h1' | 'h2' | 'h3') : 'p'

  // Track whether the cursor is inside this specific block node
  // We compare by unique id attr to avoid stale node reference issues
  const isNodeFocused = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e || !blockId) return false
      const { selection } = e.state
      const { $from } = selection
      // Walk up the document tree to find the block-level ancestor
      for (let depth = $from.depth; depth >= 0; depth--) {
        const ancestorNode = $from.node(depth)
        if (ancestorNode.attrs?.id === blockId) return true
      }
      return false
    },
  }) ?? false

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId)
  }, { delay: 400 })

  return (
    <NodeViewWrapper
      {...longPressProps}
      data-node-type={node.type.name}
      data-node-focused={isNodeFocused ? 'true' : 'false'}
      className={cn(
        'group relative rounded-md transition-all duration-150 my-px',
        isSelected && 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-900/40',
      )}
    >
      <NodeViewContent
        // @ts-expect-error - dynamic as prop
        as={Tag}
        className="px-1 mx-0 my-0 outline-none"
      />
      {/* Active left accent bar — Notion/Craft style cursor indicator */}
      {isNodeFocused && !isSelected && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-[-3px] top-[15%] bottom-[15%] w-[2.5px] rounded-full',
            'bg-primary transition-all duration-200',
          )}
          style={{ animation: 'blockAccentIn 0.18s ease both' }}
        />
      )}
      {/* Subtle background tint when cursor is here */}
      {isNodeFocused && !isSelected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md bg-primary/3 "
        />
      )}
    </NodeViewWrapper>
  )
}
