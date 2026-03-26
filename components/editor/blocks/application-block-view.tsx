'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { useLongPress } from '@/hooks/use-long-press'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ApplicationBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
  const t = useTranslations('editor')
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id
  const isSelected = blockId ? isBlockSelected(blockId) : false

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId)
  }, { delay: 400 })

  return (
    <NodeViewWrapper
      {...longPressProps}
      className={cn(
        'group relative rounded-md border border-emerald-200/40 bg-emerald-500/5 px-4 py-3 my-3 transition-colors dark:border-emerald-800/40 dark:bg-emerald-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-emerald-500/10 shadow-sm' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0 pt-[2px] text-emerald-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500/80">
            {t('blocks.application')}
          </div>
          <NodeViewContent className="text-base text-foreground [&>p:first-child]:mt-0" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}