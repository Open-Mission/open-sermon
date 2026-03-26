'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function ConclusionBlockView({ getPos }: { getPos: () => number | undefined }) {
  const t = useTranslations('editor')

  return (
    <NodeViewWrapper
      className={cn(
        'border-l-4 border-rose-500 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
        getPos() === undefined ? 'opacity-50' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0 h-4 w-4 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            {t('blocks.conclusion')}
          </div>
          <NodeViewContent className="text-sm text-muted-foreground" />
        </div>
        <div className="shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save conclusion to library')
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