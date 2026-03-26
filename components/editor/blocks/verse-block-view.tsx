'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function VerseBlockView({ node, getPos, updateAttributes }: any) {
  const { reference, text, version } = node.attrs
  const [isEditing, setIsEditing] = useState(false)

  const handleClick = () => {
    // In a real implementation, this would open the verse search modal
    // For now, we'll just toggle editing state
    setIsEditing(!isEditing)
  }

  const handleSave = (newReference: string, newText: string, newVersion: string) => {
    updateAttributes({
      reference: newReference,
      text: newText,
      version: newVersion,
    })
    setIsEditing(false)
  }

  if (isEditing) {
    // In a real implementation, we would render a form here to edit the verse
    // For now, we'll just show the verse content with an indication it's editable
    return (
      <NodeViewWrapper
        className={cn(
          'border-l-4 border-violet-500 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
          getPos() === undefined ? 'opacity-50' : ''
        )}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 h-4 w-4 text-violet-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-foreground">
              Editando versículo...
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
          <div className="flex-shrink-0 space-x-2">
            <Button variant="outline" size="xs" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="default" size="xs" onClick={() => {
              // In a real implementation, we would save the edited verse
              setIsEditing(false)
            }}>
              Salvar
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
             <div className="flex-shrink-0 h-4 w-4 text-violet-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8H5.5A2.5 2.5 0 003 10.5v9a2.5 2.5 0 002.5 2.5h9a2.5 2.5 0 002.5-2.5v-6m-6 4h.01M15.5 8a5.5 5.5 0 0111 0M15.5 8a5.5 5.5 0 00-11 0" />
               </svg>
             </div>
             <div className="flex-1 space-y-2">
               <div className="text-sm font-medium text-foreground">
                 Versículo Bíblico
               </div>
               <div className="text-sm text-muted-foreground italic">
                 Clique para inserir um versículo
               </div>
             </div>
           </>
         ) : (
           <>
             <div className="flex-shrink-0 h-4 w-4 text-violet-500">
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
         <div className="flex-shrink-0 space-x-2">
           <Button
             variant="outline"
             size="xs"
             onClick={() => {
               // Save to library functionality would go here
               console.log('Save verse to library')
             }}
           >
             Salvar na biblioteca
           </Button>
         </div>
       </div>
     </NodeViewWrapper>
   )
}