import { useState, useRef, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import { useTranslations } from 'next-intl'
import { BookOpen, Lightbulb, Target, Pin, PlayCircle, CheckCircle, Type } from 'lucide-react'

type SuggestionsItems = Array<{
  label: string
  icon: React.ComponentType<any>
  command: string
}>

export function BlockMenu() {
  const t = useTranslations('components.editor.blockMenu')
  const editor = useEditor()
  const [isVisible, setIsVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const BLOCK_ITEMS: SuggestionsItems = [
    { label: t('blocks.verse', { default: 'Versículo Bíblico' }), icon: BookOpen, command: 'verseBlock' },
    { label: t('blocks.illustration', { default: 'Ilustração' }), icon: Lightbulb, command: 'illustrationBlock' },
    { label: t('blocks.application', { default: 'Aplicação' }), icon: Target, command: 'applicationBlock' },
    { label: t('blocks.point', { default: 'Ponto Principal' }), icon: Pin, command: 'pointBlock' },
    { label: t('blocks.intro', { default: 'Introdução' }), icon: PlayCircle, command: 'introBlock' },
    { label: t('blocks.conclusion', { default: 'Conclusão' }), icon: CheckCircle, command: 'conclusionBlock' },
    { label: t('blocks.text', { default: 'Texto Livre' }), icon: Type, command: 'paragraph' },
  ]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '/') {
      event.preventDefault()
      setIsVisible(true)
      setQuery('')
      // Position the menu at the cursor
      setTimeout(() => {
        if (editor.view) {
          const { state } = editor
          const { from } = state.selection
          const coords = editor.view.coordsAtPos(from)
          setAnchorEl(document.elementFromPoint(coords.left, coords.top) || undefined)
        }
      }, 0)
    }
    
    if (isVisible && (event.key === 'Escape' || event.key === 'Enter')) {
      event.preventDefault()
      setIsVisible(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsVisible(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isVisible])

  const filteredItems = BLOCK_ITEMS.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleItemSelect = (command: string) => {
    if (command === 'verseBlock') {
      // For verse block, we'll open the modal instead of inserting directly
      setIsVisible(false)
      // In a real implementation, we would open the verse search modal here
      // For now, we'll just insert a placeholder
      editor.chain().focus().insertContent({ type: 'verseBlock', attrs: { reference: '', text: '', version: 'NVI' } }).run()
    } else {
      editor.chain().focus().insertContent({ type: command }).run()
    }
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 mt-1 w-56 rounded-md bg-card border border-border shadow-lg p-1"
      style={{
        top: anchorEl ? anchorEl.getBoundingClientRect().bottom + window.scrollY : 0,
        left: anchorEl ? anchorEl.getBoundingClientRect().left + window.scrollX : 0,
      }}
    >
      <div className="flex items-center space-x-2 p-2 border-b">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search', { default: 'Pesquisar blocos...' })}
          className="flex-1 bg-muted/50 border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>
      <div className="space-y-1">
        {filteredItems.length === 0 ? (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            {t('noResults', { default: 'Nenhum resultado encontrado' })}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer flex items-center space-x-2 px-2 py-1 text-sm rounded hover:bg-muted/50`}
              onClick={() => handleItemSelect(item.command)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}