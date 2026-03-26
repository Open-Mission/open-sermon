'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'
import { useLongPress } from '@/hooks/use-long-press'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PointBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
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
        'group relative rounded-md border border-indigo-200/40 bg-indigo-500/5 px-4 py-3 my-3 transition-colors dark:border-indigo-800/40 dark:bg-indigo-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-indigo-500/10 shadow-sm' : ''
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
        <div className="shrink-0 pt-[2px] text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l0 .01m0 0l.658-.329A5.256 5.256 0 0012 10.5a5.256 5.256 0 001.592-.329l.658-.33m0 0a5.25 5.25 0 018.25 0c-.586 0-1.154.118-1.65.329l-.658.329a5.25 5.25 0 00-8.25 0l-.658-.33a5.25 5.25 0 01-1.65-.329z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-500/80">
            {t('blocks.point')}
          </div>
          <NodeViewContent className="text-base text-foreground [&>p:first-child]:mt-0" />
        </div>
        <div className="shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save point to library')
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