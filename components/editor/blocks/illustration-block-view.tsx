'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'
import { useLongPress } from '@/hooks/use-long-press'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IllustrationBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
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
        'group relative rounded-md border border-amber-200/40 bg-amber-500/5 px-4 py-3 my-3 transition-colors dark:border-amber-800/40 dark:bg-amber-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-amber-500/10 shadow-sm' : ''
      )}
    >
      {blockId && (
        <div 
          className={cn(
            "absolute -left-6 top-3.5 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity z-10",
            isSelected && "opacity-100"
          )}
          contentEditable={false}
          onClick={(e) => {
            e.stopPropagation()
            toggleBlock(blockId)
          }}
        >
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => toggleBlock(blockId)}
          />
        </div>
      )}
      <div className="flex items-start space-x-3">
        <div className="shrink-0 pt-[2px] text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
            {t('blocks.illustration')}
          </div>
          <NodeViewContent className="text-base text-foreground [&>p:first-child]:mt-0" />
        </div>
        <div className="shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save illustration to library')
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('saveBlock')}
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}