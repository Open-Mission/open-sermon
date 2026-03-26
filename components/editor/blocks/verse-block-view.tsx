'use client';

import { NodeViewWrapper } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useBlockSelection } from '../block-selection-context'
import { Checkbox } from '@/components/ui/checkbox'

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

  const handleClick = () => {
    setIsEditing(!isEditing)
  }

  if (isEditing) {
    return (
      <NodeViewWrapper
        className={cn(
          'group relative border-l-4 border-violet-500 pl-4 py-3 my-2 rounded-r-md bg-violet-500/10',
          getPos() === undefined ? 'opacity-50' : '',
          isSelected ? 'bg-violet-500/20 shadow-sm' : ''
        )}
        onClick={handleClick}
      >
        {blockId && (
          <div 
            className="absolute -left-6 top-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity aria-selected:opacity-100 z-10" 
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
          <div className="shrink-0 h-4 w-4 text-violet-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-foreground">
              {t('editing')}
            </div>
            <div className="text-sm text-muted-foreground/80">
              {reference}
            </div>
            <blockquote className="border-l-2 border-violet-200 pl-3 italic text-base text-foreground">
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
       className={cn(
         'group relative border-l-4 border-violet-500 pl-4 py-3 my-2 rounded-r-md bg-violet-500/10',
         getPos() === undefined ? 'opacity-50' : '',
         isSelected ? 'bg-violet-500/20 shadow-sm' : ''
       )}
       onClick={handleClick}
     >
       {blockId && (
         <div 
           className="absolute -left-6 top-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity aria-selected:opacity-100 z-10" 
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
         {!reference ? (
           <>
             <div className="shrink-0 h-4 w-4 text-violet-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
               </svg>
             </div>
             <div className="flex-1 space-y-2">
               <div className="text-sm font-medium text-foreground">
                 {t('blocks.verse')}
               </div>
               <div className="text-sm text-muted-foreground italic">
                 {t('search')}
               </div>
             </div>
           </>
         ) : (
           <>
             <div className="shrink-0 h-4 w-4 text-violet-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
               </svg>
             </div>
             <div className="flex-1 space-y-2">
               <div className="text-sm font-medium text-muted-foreground/80">
                 {reference}
               </div>
               <blockquote className="border-l-2 border-violet-200 pl-3 italic text-base text-foreground">
                 {text}
               </blockquote>
               <div className="text-xs text-muted-foreground/80">
                 {version}
               </div>
             </div>
           </>
         )}
         <div className="shrink-0 space-x-2">
           <Button
             variant="outline"
             size="xs"
             onClick={(e) => {
               e.stopPropagation();
               // Save to library functionality would go here
               console.log('Save verse to library')
             }}
           >
             {t('saveToLibrary')}
           </Button>
         </div>
       </div>
     </NodeViewWrapper>
   )
}