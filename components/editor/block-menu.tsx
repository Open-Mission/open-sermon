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
  Underline,
  MessageSquare
} from 'lucide-react'

type SuggestionsItem = {
  label: string
  icon: LucideIcon
  command: (editor: Editor) => void
  requiresInput?: boolean
  isInlineVerse?: boolean
}

type BlockMenuProps = {
  editor: Editor | null
}

export const VERSE_SEARCH_EVENT = 'open-verse-search'
export const OPEN_BLOCK_MENU_EVENT = 'open-block-menu'

export function dispatchVerseSearchEvent() {
  window.dispatchEvent(new CustomEvent(VERSE_SEARCH_EVENT))
}

export function openBlockMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_BLOCK_MENU_EVENT))
}

export function BlockMenu({ editor }: BlockMenuProps) {
  const t = useTranslations('editor')
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const groupedListRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (isVisible && !isMobile && itemRefs.current[selectedIndex]) {
      setTimeout(() => {
        itemRefs.current[selectedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 50)
    }
  }, [selectedIndex, isVisible, isMobile])

  useEffect(() => {
    itemRefs.current = []
    if (!isMobile) {
      setSelectedIndex(0)
    }
  }, [query, isMobile])

  type BlockGroup = {
    title: string
    items: SuggestionsItem[]
  }

  const BLOCK_GROUPS = React.useMemo<BlockGroup[]>(() => [
    {
      title: t('blockGroups.basic', { default: 'Básico' }),
      items: [
        { label: t('blocks.h1', { default: 'Título 1' }), icon: Heading1, command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: t('blocks.h2', { default: 'Título 2' }), icon: Heading2, command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: t('blocks.h3', { default: 'Título 3' }), icon: Heading3, command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: t('blocks.text', { default: 'Texto Livre' }), icon: Type, command: (e) => e.chain().focus().setParagraph().run() },
        { label: t('blocks.bold', { default: 'Negrito' }), icon: Bold, command: (e) => e.chain().focus().toggleBold().run() },
        { label: t('blocks.italic', { default: 'Itálico' }), icon: Italic, command: (e) => e.chain().focus().toggleItalic().run() },
        { label: t('blocks.underline', { default: 'Sublinhado' }), icon: Underline, command: (e) => e.chain().focus().toggleUnderline().run() },
      ]
    },
    {
      title: t('blockGroups.sections', { default: 'Seções' }),
      items: [
        { label: t('blocks.verse', { default: 'Versículo Bíblico' }), icon: BookOpen, command: () => {}, requiresInput: true },
        { label: t('blocks.inlineVerse', { default: 'Versículo Inline' }), icon: Type, command: () => {}, isInlineVerse: true },
        { label: t('blocks.callout', { default: 'Callout' }), icon: MessageSquare, command: (e) => e.chain().focus().insertContent({ type: 'calloutBlock', content: [{ type: 'paragraph' }] }).run() },
        { label: t('blocks.illustration', { default: 'Ilustração' }), icon: Lightbulb, command: (e) => e.chain().focus().insertContent({ type: 'illustrationBlock' }).run() },
        { label: t('blocks.application', { default: 'Aplicação' }), icon: Target, command: (e) => e.chain().focus().insertContent({ type: 'applicationBlock' }).run() },
        { label: t('blocks.point', { default: 'Ponto Principal' }), icon: Pin, command: (e) => e.chain().focus().insertContent({ type: 'pointBlock' }).run() },
        { label: t('blocks.intro', { default: 'Introdução' }), icon: PlayCircle, command: (e) => e.chain().focus().insertContent({ type: 'introBlock' }).run() },
        { label: t('blocks.conclusion', { default: 'Conclusão' }), icon: CheckCircle, command: (e) => e.chain().focus().insertContent({ type: 'conclusionBlock' }).run() },
      ]
    }
  ], [t])

  const BLOCK_ITEMS = React.useMemo<SuggestionsItem[]>(() => 
    BLOCK_GROUPS.flatMap(group => group.items),
    [BLOCK_GROUPS]
  )

  const filteredItems = React.useMemo(() => 
    BLOCK_ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    [BLOCK_ITEMS, query]
  )

  const handleItemSelect = useCallback((item: SuggestionsItem) => {
    if (!editor) return
    
    const wasVisible = isVisible
    
    // Clear the '/' and the search query before running command
    editor.chain().focus().deleteRange({ 
      from: editor.state.selection.from - 1 - query.length, 
      to: editor.state.selection.from 
    }).run()
    
    if (item.requiresInput) {
      // Insert placeholder block first for verse, and append an empty paragraph after it
      editor.chain().focus().insertContent([
        { 
          type: 'verseBlock', 
          attrs: { reference: '', text: '', version: 'NVI' },
          content: [{ type: 'paragraph' }]
        },
        { type: 'paragraph' }
      ]).run()
      dispatchVerseSearchEvent()
    } else if (item.isInlineVerse) {
      editor.chain().focus().insertContent([
        { 
          type: 'inlineVerse', 
          attrs: { reference: '', text: '', version: 'NVI' },
        },
      ]).run()
      dispatchVerseSearchEvent()
    } else {
      item.command(editor)
    }
    
    // Focus editor after inserting content (especially important for mobile)
    setTimeout(() => {
      editor.chain().focus().run()
    }, 50)
    
    setIsVisible(false)
    
    // Blur active element to close keyboard on mobile
    if (isMobile && wasVisible) {
      setTimeout(() => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur()
      }, 150)
    }
  }, [editor, query, isVisible, isMobile])

  useEffect(() => {
    if (!editor) return

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return
      
      if (event.key === 'Escape') {
        setIsVisible(false)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex(prev => (prev + 1) % BLOCK_ITEMS.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex(prev => (prev - 1 + BLOCK_ITEMS.length) % BLOCK_ITEMS.length)
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (filteredItems.length > 0) {
          const itemToSelect = filteredItems[selectedIndex] || filteredItems[0]
          handleItemSelect(itemToSelect)
        }
        return
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [editor, isVisible, filteredItems, selectedIndex, handleItemSelect, BLOCK_ITEMS])

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

  useEffect(() => {
    if (!editor) return

    const handleOpenBlockMenu = () => {
      setQuery('')
      setSelectedIndex(0)
      
      if (isMobile) {
        setIsVisible(true)
      } else {
        const { state } = editor
        const { from } = state.selection
        const coords = editor.view.coordsAtPos(from)
        
        setIsVisible(true)
        setPosition({ 
          top: window.scrollY + 20, 
          left: coords.left + window.scrollX 
        })
      }
    }

    window.addEventListener(OPEN_BLOCK_MENU_EVENT, handleOpenBlockMenu)
    return () => window.removeEventListener(OPEN_BLOCK_MENU_EVENT, handleOpenBlockMenu)
  }, [isMobile, editor])

  const MenuList = ({ grouped = false }: { grouped?: boolean }): React.ReactNode => {
    const flatItems = grouped 
      ? BLOCK_GROUPS.flatMap(group => group.items).filter(item => 
          item.label.toLowerCase().includes(query.toLowerCase())
        )
      : filteredItems

    return (
      <div className="max-h-80 overflow-y-auto p-1 space-y-0.5">
        {flatItems.length === 0 ? (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            {t('noResults', { default: 'Nenhum resultado encontrado' })}
          </div>
        ) : (
          flatItems.map((item, index) => (
            <button
              key={index}
              ref={(el) => { itemRefs.current[index] = el }}
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
  }

  const GroupedMenuList = () => (
    <div ref={groupedListRef} className="max-h-[60vh] overflow-y-auto">
      {BLOCK_GROUPS.map((group, groupIndex) => {
        const groupFilteredItems = group.items.filter(item => 
          item.label.toLowerCase().includes(query.toLowerCase())
        )
        if (groupFilteredItems.length === 0) return null
        
        return (
          <div key={groupIndex} className="mb-4">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {groupFilteredItems.map((item, index) => {
                const globalIndex = BLOCK_GROUPS.slice(0, groupIndex).reduce((acc, g) => acc + g.items.length, 0) + index
                return (
                  <button
                    key={globalIndex}
                    ref={(el) => { itemRefs.current[globalIndex] = el }}
                    className={`w-full text-left flex items-center space-x-2 px-3 py-2.5 text-sm rounded transition-colors ${
                      !isMobile && globalIndex === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/80'
                    }`}
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => !isMobile && setSelectedIndex(globalIndex)}
                  >
                    <item.icon className={`h-4 w-4 ${!isMobile && globalIndex === selectedIndex ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  if (!isVisible) return null

  if (isMobile) {
    return (
      <Drawer 
        open={isVisible} 
        onOpenChange={(open) => {
          if (!open) {
            setIsVisible(false)
            setTimeout(() => {
              document.activeElement instanceof HTMLElement && document.activeElement.blur()
            }, 100)
          }
        }}
      >
        <DrawerContent className="pb-8">
          <DrawerHeader>
            <DrawerTitle>{t('search', { default: 'Comandos' })}</DrawerTitle>
            <DrawerDescription>
              Selecione um bloco para inserir no seu sermão
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Pesquisar..."
              className="w-full bg-muted/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              enterKeyHint="search"
            />
          </div>
          <div className="px-3 pb-4">
            <GroupedMenuList />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 mt-1 w-80 rounded-md bg-card border border-border shadow-2xl p-1 overflow-hidden"
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
      <GroupedMenuList />
    </div>
  )
}