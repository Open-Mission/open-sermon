import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'

export function IntroBlockView({ node, getPos, updateAttributes }: any) {
  return (
    <NodeViewWrapper
      className={cn(
        'border-l-4 border-sky-400 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
        getPos() === undefined ? 'opacity-50' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-4 w-4 text-sky-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.75 7.5l-.25 3.064a2.256 2.256 0 01-2.25 2.247H7.5a2.25 2.25 0 01-2.25-2.25v-1.372c0-1.237.63-2.289 1.495-2.775l2.738-.354a2.25 2.25 0 011.697-.03l.25-3.042a2.25 2.25 0 012.256-.025h2.75a2.25 2.25 0 012.256.025z" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            Introdução
          </div>
          <NodeViewContent className="text-sm text-muted-foreground" />
        </div>
        <div className="flex-shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save intro to library')
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Salvar na biblioteca
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}