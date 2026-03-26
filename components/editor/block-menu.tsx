'use client';

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription 
} from '@/components/ui/drawer'
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  Pin, 
  PlayCircle, 
  CheckCircle, 
  Type, 
  LucideIcon, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Underline 
} from 'lucide-react'

type SuggestionsItem = {
  label: string
  icon: LucideIcon
  command: (editor: Editor) => void
}

type BlockMenuProps = {
  editor: Editor | null
}

export function BlockMenu({ editor }: BlockMenuProps) {
  const t = useTranslations('editor')
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const BLOCK_ITEMS = React.useMemo<SuggestionsItem[]>(() => [
    { label: t('blocks.verse', { default: 'Versículo Bíblico' }), icon: BookOpen, command: (e) => e.chain().focus().insertContent({ type: 'verseBlock', attrs: { reference: '', text: '', version: 'NVI' } }).run() },
    { label: t('blocks.illustration', { default: 'Ilustração' }), icon: Lightbulb, command: (e) => e.chain().focus().insertContent({ type: 'illustrationBlock' }).run() },
    { label: t('blocks.application', { default: 'Aplicação' }), icon: Target, command: (e) => e.chain().focus().insertContent({ type: 'applicationBlock' }).run() },
    { label: t('blocks.point', { default: 'Ponto Principal' }), icon: Pin, command: (e) => e.chain().focus().insertContent({ type: 'pointBlock' }).run() },
    { label: t('blocks.intro', { default: 'Introdução' }), icon: PlayCircle, command: (e) => e.chain().focus().insertContent({ type: 'introBlock' }).run() },
    { label: t('blocks.conclusion', { default: 'Conclusão' }), icon: CheckCircle, command: (e) => e.chain().focus().insertContent({ type: 'conclusionBlock' }).run() },
    { label: t('blocks.h1', { default: 'Título 1' }), icon: Heading1, command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: t('blocks.h2', { default: 'Título 2' }), icon: Heading2, command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: t('blocks.h3', { default: 'Título 3' }), icon: Heading3, command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: t('blocks.text', { default: 'Texto Livre' }), icon: Type, command: (e) => e.chain().focus().setParagraph().run() },
    { label: t('blocks.bold', { default: 'Negrito' }), icon: Bold, command: (e) => e.chain().focus().toggleBold().run() },
    { label: t('blocks.italic', { default: 'Itálico' }), icon: Italic, command: (e) => e.chain().focus().toggleItalic().run() },
    { label: t('blocks.underline', { default: 'Sublinhado' }), icon: Underline, command: (e) => e.chain().focus().toggleUnderline().run() },
  ], [t])

  const filteredItems = React.useMemo(() => 
    BLOCK_ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    [BLOCK_ITEMS, query]
  )

  const handleItemSelect = useCallback((item: SuggestionsItem) => {
    if (!editor) return
    
    // Clear the '/' and the search query before running command
    editor.chain().focus().deleteRange({ 
      from: editor.state.selection.from - 1 - query.length, 
      to: editor.state.selection.from 
    }).run()
    
    item.command(editor)
    setIsVisible(false)
  }, [editor, query])

  useEffect(() => {
    if (!editor) return

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isVisible) {
        if (event.key === 'Escape') {
          setIsVisible(false)
          return
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filteredItems.length)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
          return
        }
        if (event.key === 'Enter') {
          event.preventDefault()
          if (filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex])
          }
          return
        }
        return
      }

      if (editor.isFocused && event.key === '/') {
        event.preventDefault()
        const { state } = editor
        const { from } = state.selection
        const coords = editor.view.coordsAtPos(from)
        
        setIsVisible(true)
        setQuery('')
        setSelectedIndex(0)
        
        // Only use coords on desktop
        if (!isMobile) {
          setPosition({ 
            top: coords.bottom + window.scrollY, 
            left: coords.left + window.scrollX 
          })
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [editor, isVisible, filteredItems, selectedIndex, handleItemSelect, isMobile])

  useEffect(() => {
    if (!isVisible || isMobile) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisible, isMobile])

  const MenuList = (
    <div className="max-h-80 overflow-y-auto p-1 space-y-0.5">
      {filteredItems.length === 0 ? (
        <div className="px-2 py-1 text-sm text-muted-foreground">
          {t('noResults', { default: 'Nenhum resultado encontrado' })}
        </div>
      ) : (
        filteredItems.map((item, index) => (
          <button
            key={index}
            className={`w-full text-left flex items-center space-x-2 px-2 py-2 text-sm rounded transition-colors ${
              index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/80'
            }`}
            onClick={() => handleItemSelect(item)}
            onMouseEnter={() => !isMobile && setSelectedIndex(index)}
          >
            <item.icon className={`h-4 w-4 ${index === selectedIndex ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            <span>{item.label}</span>
          </button>
        ))
      )}
    </div>
  )

  if (!isVisible) return null

  if (isMobile) {
    return (
      <Drawer open={isVisible} onOpenChange={setIsVisible}>
        <DrawerContent className="pb-8">
          <DrawerHeader>
            <DrawerTitle>{t('search', { default: 'Comandos' })}</DrawerTitle>
            <DrawerDescription>
              Selecione um bloco para inserir no seu sermão
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Pesquisar..."
              className="w-full bg-muted/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          {MenuList}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 mt-1 w-64 rounded-md bg-card border border-border shadow-2xl p-1 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex items-center space-x-2 p-2 border-b">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          placeholder={t('search', { default: 'Pesquisar comandos...' })}
          className="flex-1 bg-muted/50 border-none px-2 py-1 text-sm focus:outline-none focus:ring-0"
          autoFocus
        />
      </div>
      {MenuList}
    </div>
  )
}