'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'
import { useLongPress } from '@/hooks/use-long-press'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IntroBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
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
        'group relative rounded-md border border-sky-200/40 bg-sky-500/5 px-4 py-3 my-3 transition-colors dark:border-sky-800/40 dark:bg-sky-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-sky-500/10 shadow-sm' : ''
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
        <div className="shrink-0 pt-[2px] text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500/80">
            {t('blocks.intro')}
          </div>
          <NodeViewContent className="text-base text-foreground [&>p:first-child]:mt-0" />
        </div>
        <div className="shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save intro to library')
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