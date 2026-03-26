import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'

export function IllustrationBlockView({ node, getPos, updateAttributes }: any) {
  return (
    <NodeViewWrapper
      className={cn(
        'border-l-4 border-amber-400 pl-4 py-3 my-2 rounded-r-md bg-muted/30',
        getPos() === undefined ? 'opacity-50' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-4 w-4 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a1.05 1.05 0 001.514.572l2.167-.49a.75.75 0 01.785.05l2.369.18a.75.75 0 00.774-.61l-.008-.303c-.131-.677-.43-1.274-.89-1.72l-.244-.239a3.75 3.75 0 10-5.25 0l-.243.24c-.46.446-.759 1.043-.89 1.72l-.008.303a.75.75 0 00-.39.275A.75.75 0 016 15.75a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.375.375 0 00-.375.375.375.375 0 00-.375-.375z" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-foreground">
            Ilustração
          </div>
          <NodeViewContent className="text-sm text-muted-foreground" />
        </div>
        <div className="flex-shrink-0 space-x-2">
          <button
            onClick={() => {
              // Save to library functionality would go here
              console.log('Save illustration to library')
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