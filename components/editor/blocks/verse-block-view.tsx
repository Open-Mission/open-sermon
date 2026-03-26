'use client';

import { NodeViewWrapper } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { useLongPress } from '@/hooks/use-long-press'

interface VerseAttrs {
  id?: string;
  reference?: string;
  text?: string;
  version?: string;
}

interface VerseNode {
  attrs: VerseAttrs;
}

export function VerseBlockView({ node, getPos }: { 
  node: VerseNode, 
  getPos: () => number | undefined
}) {
  const t = useTranslations('editor.verse')
  const tCommon = useTranslations('common')
  const { reference, text, version } = node.attrs
  const [isEditing, setIsEditing] = useState(false)
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const blockId = node.attrs.id as string | undefined
  const isSelected = blockId ? isBlockSelected(blockId) : false

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId)
  }, { delay: 400 })

  const handleClick = () => {
    setIsEditing(!isEditing)
  }

  if (isEditing) {
    return (
      <NodeViewWrapper
        {...longPressProps}
        className={cn(
          'group relative rounded-md border border-violet-200/40 bg-violet-500/5 px-4 py-3 my-3 transition-colors dark:border-violet-800/40 dark:bg-violet-500/10',
          getPos() === undefined ? 'opacity-50' : '',
          isSelected ? 'bg-violet-500/10 shadow-sm' : ''
        )}
        onClick={(e: React.MouseEvent) => {
          longPressProps.onClick(e)
          handleClick()
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="shrink-0 pt-[2px] text-violet-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
              {t('editing')}
            </div>
            <div className="text-sm font-medium text-muted-foreground/80 mb-1">
              {reference}
            </div>
            <blockquote className="border-l-2 border-violet-300/50 pl-3 italic text-base text-foreground mb-1">
              {text}
            </blockquote>
            <div className="text-xs text-muted-foreground/80">
              {version}
            </div>
          </div>
          <div className="shrink-0 space-x-2">
            <Button variant="outline" size="xs" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>
              {tCommon('cancel')}
            </Button>
            <Button variant="default" size="xs" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>
              {tCommon('save')}
            </Button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

   return (
     <NodeViewWrapper
       {...longPressProps}
       className={cn(
         'group relative rounded-md border border-violet-200/40 bg-violet-500/5 px-4 py-3 my-3 transition-colors dark:border-violet-800/40 dark:bg-violet-500/10 cursor-text',
         getPos() === undefined ? 'opacity-50' : '',
         isSelected ? 'bg-violet-500/10 shadow-sm' : ''
       )}
        onClick={(e: React.MouseEvent) => {
          longPressProps.onClick(e)
          handleClick()
        }}
     >
       <div className="flex items-start space-x-3">
         {!reference ? (
           <>
             <div className="shrink-0 pt-[2px] text-violet-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
               </svg>
             </div>
             <div className="flex-1 min-w-0 mt-[2px]">
               <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
                 {t('blocks.verse')}
               </div>
               <div className="text-base text-muted-foreground italic font-medium">
                 {t('search')}
               </div>
             </div>
           </>
         ) : (
           <>
             <div className="shrink-0 pt-[2px] text-violet-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
               </svg>
             </div>
             <div className="flex-1 min-w-0">
               <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
                 {reference}
               </div>
               <blockquote className="border-l-2 border-violet-300/50 pl-3 italic text-base text-foreground mb-1">
                 {text}
               </blockquote>
               <div className="text-xs text-muted-foreground/80">
                 {version}
               </div>
             </div>
           </>
         )}
       </div>
     </NodeViewWrapper>
   )
}