import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useBlockSelection } from '../block-selection-context'
import { useLongPress } from '@/hooks/use-long-press'

export function SelectableTextBlockView({ node }: { node: { type: { name: string }, attrs: Record<string, unknown> } }) {
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id as string | undefined
  const isSelected = blockId ? isBlockSelected(blockId) : false
  const Tag = node.type.name === 'heading' ? `h${node.attrs.level || 1}` : 'p'

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId)
  }, { delay: 400 })

  return (
    <NodeViewWrapper
      {...longPressProps}
      className={cn(
        'group relative rounded-md transition-colors my-[2px]',
        isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-100 dark:ring-blue-900/30' : ''
      )}
    >
      {/* @ts-expect-error - dynamic as prop */}
      <NodeViewContent as={Tag} className="px-1 mx-0 my-0 placeholder:text-muted-foreground outline-none" />
    </NodeViewWrapper>
  )
}
