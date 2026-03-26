'use client';

import { NodeViewWrapper } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface VerseAttrs {
  reference?: string;
  text?: string;
  version?: string;
}

interface VerseNode {
  attrs: VerseAttrs;
}

export function VerseBlockView({ node, getPos, updateAttributes }: { 
  node: VerseNode, 
  getPos: () => number | undefined, 
  updateAttributes: (attrs: Partial<VerseAttrs>) => void 
}) {
  const t = useTranslations('editor.verse')
  const tCommon = useTranslations('common')
  const { reference, text, version } = node.attrs
  const [isEditing, setIsEditing] = useState(false)

  const handleClick = () => {
    setIsEditing(!isEditing)
  }

  if (isEditing) {
    return (
      <NodeViewWrapper
        className={cn(
          'border-l-4 border-violet-500 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
          getPos() === undefined ? 'opacity-50' : ''
        )}
        onClick={handleClick}
      >
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
            <div className="text-sm text-muted-foreground">
              {reference}
            </div>
            <blockquote className="border-l-2 border-violet-200 pl-3 italic">
              {text}
            </blockquote>
            <div className="text-xs text-muted-foreground">
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
         'border-l-4 border-violet-500 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
         getPos() === undefined ? 'opacity-50' : ''
       )}
       onClick={handleClick}
     >
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
               <div className="text-sm font-medium text-foreground">
                 {reference}
               </div>
               <blockquote className="border-l-2 border-violet-200 pl-3 italic">
                 {text}
               </blockquote>
               <div className="text-xs text-muted-foreground">
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