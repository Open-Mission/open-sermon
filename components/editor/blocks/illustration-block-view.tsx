'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function IllustrationBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
  const t = useTranslations('editor')
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id
  const isSelected = blockId ? isBlockSelected(blockId) : false

  return (
    <NodeViewWrapper
      className={cn(
        'group relative border-l-4 border-amber-500 pl-4 py-3 my-2 rounded-r-md bg-amber-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-amber-500/20 shadow-sm' : ''
      )}
    >
      {blockId && (
        <div 
          className="absolute -left-6 top-3.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity aria-selected:opacity-100 z-10" 
          aria-selected={isSelected}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => toggleBlock(blockId)}
          />
        </div>
      )}
      <div className="flex items-start space-x-3">
        <div className="shrink-0 h-4 w-4 text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            {t('blocks.illustration')}
          </div>
          <NodeViewContent className="text-base text-foreground" />
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