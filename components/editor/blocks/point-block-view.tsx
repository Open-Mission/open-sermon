'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PointBlockView({ node, getPos }: { node: any, getPos: () => number | undefined }) {
  const t = useTranslations('editor')
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id
  const isSelected = blockId ? isBlockSelected(blockId) : false

  return (
    <NodeViewWrapper
      className={cn(
        'group relative border-l-4 border-blue-500 pl-4 py-3 my-2 rounded-r-md bg-blue-500/10',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-blue-500/20 shadow-sm' : ''
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
        <div className="shrink-0 h-4 w-4 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l0 .01m0 0l.658-.329A5.256 5.256 0 0012 10.5a5.256 5.256 0 001.592-.329l.658-.33m0 0a5.25 5.25 0 018.25 0c-.586 0-1.154.118-1.65.329l-.658.329a5.25 5.25 0 00-8.25 0l-.658-.33a5.25 5.25 0 01-1.65-.329z" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            {t('blocks.point')}
          </div>
          <NodeViewContent className="text-base text-foreground" />
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