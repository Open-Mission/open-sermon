import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'

export function ApplicationBlockView({ node, getPos, updateAttributes }: any) {
  return (
    <NodeViewWrapper
      className={cn(
        'border-l-4 border-emerald-500 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
        getPos() === undefined ? 'opacity-50' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-4 w-4 text-emerald-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.099 9.099a3 3 0 104.242 4.242M9.099 9.099V3.5a2.5 2.5 0 015 0v5.598m-5 5.598a3 3 0 114.242-4.242" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            Aplicação
          </div>
          <NodeViewContent className="text-sm text-muted-foreground" />
        </div>
        <div className="flex-shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save application to library')
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