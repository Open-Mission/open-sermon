'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { type Editor } from '@tiptap/react'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  BookOpen,
  Lightbulb,
  Target,
  Pin,
  PlayCircle,
  CheckCircle,
  Type,
  type LucideIcon,
  Heading1,
  Heading2,
  Heading3,
  MessageSquare,
  Quote,
  Hash,
} from 'lucide-react'
import { dispatchVerseSearchEvent } from './block-menu'

// ─── Types ───────────────────────────────────────────────────────────────────

type CommandItem = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  keywords: string[]
  group: string
  command: (editor: Editor, range?: { from: number; to: number }) => void
}

type CommandGroup = {
  id: string
  title: string
  items: CommandItem[]
}

export type SlashMenuState = {
  isOpen: boolean
  position: { top: number; left: number }
  query: string
  range: { from: number; to: number } | null
}

export const SLASH_MENU_EVENT = 'slash-menu:open'
export const SLASH_MENU_CLOSE_EVENT = 'slash-menu:close'
export const SLASH_MENU_QUERY_EVENT = 'slash-menu:query'

export function openSlashMenu(position: { top: number; left: number }, range: { from: number; to: number }) {
  window.dispatchEvent(new CustomEvent(SLASH_MENU_EVENT, { detail: { position, range } }))
}

export function closeSlashMenu() {
  window.dispatchEvent(new CustomEvent(SLASH_MENU_CLOSE_EVENT))
}

export function updateSlashMenuQuery(query: string) {
  window.dispatchEvent(new CustomEvent(SLASH_MENU_QUERY_EVENT, { detail: { query } }))
}

// ─── Command definitions ──────────────────────────────────────────────────────

function useCommandGroups(t: ReturnType<typeof useTranslations<'editor'>>): CommandGroup[] {
  return useMemo(() => [
    {
      id: 'basic',
      title: t('blockGroups.basic', { default: 'Básico' }),
      items: [
        {
          id: 'text',
          label: t('blocks.text', { default: 'Texto' }),
          description: 'Parágrafo de texto comum',
          icon: Type,
          keywords: ['text', 'paragraph', 'parágrafo', 'texto'],
          group: 'basic',
          command: (e) => e.chain().focus().setParagraph().run(),
        },
        {
          id: 'h1',
          label: t('blocks.h1', { default: 'Título 1' }),
          description: 'Seção principal',
          icon: Heading1,
          keywords: ['h1', 'heading', 'title', 'título', 'grande'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          id: 'h2',
          label: t('blocks.h2', { default: 'Título 2' }),
          description: 'Seção secundária',
          icon: Heading2,
          keywords: ['h2', 'heading', 'subtitle', 'título', 'médio'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          id: 'h3',
          label: t('blocks.h3', { default: 'Título 3' }),
          description: 'Subseção',
          icon: Heading3,
          keywords: ['h3', 'heading', 'subheading', 'subtítulo', 'pequeno'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          id: 'quote',
          label: 'Citação',
          description: 'Bloco de citação',
          icon: Quote,
          keywords: ['quote', 'blockquote', 'citação', 'citar'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleBlockquote().run(),
        },
        {
          id: 'callout',
          label: t('blocks.callout', { default: 'Destaque' }),
          description: 'Caixa de destaque com emoji',
          icon: MessageSquare,
          keywords: ['callout', 'note', 'info', 'destaque', 'aviso'],
          group: 'basic',
          command: (e) => e.chain().focus().insertContent({ type: 'calloutBlock', content: [{ type: 'paragraph' }] }).run(),
        },
      ],
    },
    {
      id: 'sermon',
      title: t('blockGroups.sections', { default: 'Seções do Sermão' }),
      items: [
        {
          id: 'verse',
          label: t('blocks.verse', { default: 'Versículo Bíblico' }),
          description: 'Buscar e inserir versículo',
          icon: BookOpen,
          keywords: ['verse', 'bible', 'versículo', 'bíblia', 'scripture'],
          group: 'sermon',
          command: (e) => {
            e.chain().focus().insertContent([
              { type: 'verseBlock', attrs: { reference: '', text: '', version: 'NVI' }, content: [{ type: 'paragraph' }] },
              { type: 'paragraph' },
            ]).run()
            dispatchVerseSearchEvent()
          },
        },
        {
          id: 'inlineVerse',
          label: t('blocks.inlineVerse', { default: 'Verso Inline' }),
          description: 'Versículo como referência inline',
          icon: Hash,
          keywords: ['inline', 'verse', 'versículo', 'referência'],
          group: 'sermon',
          command: (e) => {
            e.chain().focus().insertContent([
              { type: 'inlineVerse', attrs: { reference: '', text: '', version: 'NVI' } },
            ]).run()
            dispatchVerseSearchEvent()
          },
        },
        {
          id: 'intro',
          label: t('blocks.intro', { default: 'Introdução' }),
          description: 'Bloco de abertura do sermão',
          icon: PlayCircle,
          keywords: ['intro', 'introduction', 'abertura', 'introdução'],
          group: 'sermon',
          command: (e) => e.chain().focus().insertContent({ type: 'introBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'point',
          label: t('blocks.point', { default: 'Ponto Principal' }),
          description: 'Argumento central da mensagem',
          icon: Pin,
          keywords: ['point', 'main', 'ponto', 'central', 'argumento'],
          group: 'sermon',
          command: (e) => e.chain().focus().insertContent({ type: 'pointBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'illustration',
          label: t('blocks.illustration', { default: 'Ilustração' }),
          description: 'História ou exemplo ilustrativo',
          icon: Lightbulb,
          keywords: ['illustration', 'story', 'example', 'ilustração', 'história', 'exemplo'],
          group: 'sermon',
          command: (e) => e.chain().focus().insertContent({ type: 'illustrationBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'application',
          label: t('blocks.application', { default: 'Aplicação' }),
          description: 'Como aplicar na vida prática',
          icon: Target,
          keywords: ['application', 'apply', 'aplicação', 'aplicar', 'prática'],
          group: 'sermon',
          command: (e) => e.chain().focus().insertContent({ type: 'applicationBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'conclusion',
          label: t('blocks.conclusion', { default: 'Conclusão' }),
          description: 'Fechamento e chamado à ação',
          icon: CheckCircle,
          keywords: ['conclusion', 'closing', 'conclusão', 'fechamento'],
          group: 'sermon',
          command: (e) => e.chain().focus().insertContent({ type: 'conclusionBlock', content: [{ type: 'paragraph' }] }).run(),
        },
      ],
    },
  ], [t])
}

// ─── Main component ───────────────────────────────────────────────────────────

type SlashCommandMenuProps = {
  editor: Editor | null
}

export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const t = useTranslations('editor')
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [range, setRange] = useState<{ from: number; to: number } | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const commandGroups = useCommandGroups(t)


  const filteredGroups = useMemo(() => {
    if (!query.trim()) return commandGroups
    const q = query.toLowerCase()
    return commandGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some(k => k.includes(q))
        ),
      }))
      .filter(group => group.items.length > 0)
  }, [commandGroups, query])

  const flatFiltered = useMemo(() => filteredGroups.flatMap(g => g.items), [filteredGroups])

  const closeMenu = useCallback((restoreFocus = true) => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setQuery('')
      setSelectedIndex(0)
      if (restoreFocus && editor) {
        setTimeout(() => editor.commands.focus(), 50)
      }
    }, 180)
  }, [editor])

  // Listen for open events
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { position: { top: number; left: number }; range: { from: number; to: number } }
      setPosition(detail.position)
      setRange(detail.range)
      setQuery('')
      setSelectedIndex(0)
      if (isMobile) {
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          active.blur();
        }
      }
      setIsOpen(true)
    }

    const handleClose = () => closeMenu(true)

    const handleQuery = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query: string }
      setQuery(detail.query)
      setSelectedIndex(0)
    }

    window.addEventListener(SLASH_MENU_EVENT, handleOpen)
    window.addEventListener(SLASH_MENU_CLOSE_EVENT, handleClose)
    window.addEventListener(SLASH_MENU_QUERY_EVENT, handleQuery)
    return () => {
      window.removeEventListener(SLASH_MENU_EVENT, handleOpen)
      window.removeEventListener(SLASH_MENU_CLOSE_EVENT, handleClose)
      window.removeEventListener(SLASH_MENU_QUERY_EVENT, handleQuery)
    }
  }, [closeMenu, isMobile])

  // Auto-focus search on open
  useEffect(() => {
    if (isOpen && !isMobile) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [isOpen, isMobile])

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen) return
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedIndex, isOpen])



  useEffect(() => {
    if (!isOpen || isMobile) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, isMobile, closeMenu])

  const executeCommand = useCallback((item: CommandItem) => {
    if (!editor) return

    // Compute the actual range to delete: from the slash position to current cursor
    // The slash is at range.from, then the user may have typed query chars after it
    let deleteRange = range
    if (range && query.length > 0) {
      // The '/' + query.length chars were typed
      deleteRange = { from: range.from, to: range.from + 1 + query.length }
    }

    if (deleteRange) {
      // Clamp to document bounds
      const docSize = editor.state.doc.content.size
      const safeFrom = Math.max(0, Math.min(deleteRange.from, docSize))
      const safeTo = Math.max(safeFrom, Math.min(deleteRange.to, docSize))
      if (safeTo > safeFrom) {
        editor.chain().focus().deleteRange({ from: safeFrom, to: safeTo }).run()
      }
    } else {
      editor.commands.focus()
    }

    item.command(editor, deleteRange ?? undefined)
    closeMenu(false)
  }, [editor, range, query, closeMenu])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMenu(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % flatFiltered.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + flatFiltered.length) % flatFiltered.length)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (flatFiltered[selectedIndex]) executeCommand(flatFiltered[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, flatFiltered, selectedIndex, closeMenu, executeCommand])

  if (!isOpen) return null

  // ─── Mobile bottom sheet ────────────────────────────
  if (isMobile) {
    return (
      <div className="slash-menu-mobile-overlay" onClick={() => closeMenu()}>
        <div
          className={`slash-menu-mobile-sheet ${isClosing ? 'slash-menu-sheet-closing' : 'slash-menu-sheet-opening'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="slash-menu-handle-bar">
            <div className="slash-menu-handle" />
          </div>

          {/* Header */}
          <div className="slash-menu-mobile-header">
            <div className="slash-menu-mobile-title">
              <span className="slash-menu-mobile-title-icon">/</span>
              <span>Comandos</span>
            </div>
            <button className="slash-menu-close-btn" onClick={() => closeMenu()} aria-label="Fechar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="slash-menu-search-wrapper">
            <svg className="slash-menu-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M10 6.5C10 8.43 8.43 10 6.5 10C4.57 10 3 8.43 3 6.5C3 4.57 4.57 3 6.5 3C8.43 3 10 4.57 10 6.5ZM9.5 10.5L12.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar comandos..."
              className="slash-menu-search-input"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button className="slash-menu-search-clear" onClick={() => setQuery('')}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Items */}
          <div ref={menuRef} className="slash-menu-mobile-items">
            {filteredGroups.length === 0 ? (
              <div className="slash-menu-empty">
                <span>Nenhum resultado para &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const groupStartIndex = flatFiltered.findIndex(i => i.id === group.items[0]?.id)
                return (
                  <div key={group.id} className="slash-menu-group">
                    <div className="slash-menu-group-label">{group.title}</div>
                    <div className="slash-menu-mobile-grid">
                      {group.items.map((item, idx) => {
                        const globalIdx = groupStartIndex + idx
                        return (
                          <button
                            key={item.id}
                            data-index={globalIdx}
                            className={`slash-menu-mobile-tile ${globalIdx === selectedIndex ? 'slash-menu-tile-selected' : ''}`}
                            onClick={() => executeCommand(item)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                          >
                            <div className="slash-menu-tile-icon">
                              <item.icon size={20} />
                            </div>
                            <span className="slash-menu-tile-label">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── Desktop floating popover ────────────────────────
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const menuH = 400
  const menuW = 300
  const adjustedTop = position.top + menuH > viewportH - 16
    ? position.top - menuH - 8
    : position.top + 4
  const adjustedLeft = position.left + menuW > viewportW - 16
    ? viewportW - menuW - 16
    : position.left

  return (
    <div
      ref={menuRef}
      className={`slash-menu-desktop ${isClosing ? 'slash-menu-desktop-closing' : 'slash-menu-desktop-opening'}`}
      style={{ top: adjustedTop, left: adjustedLeft }}
    >
      {/* Search */}
      <div className="slash-menu-desktop-search">
        <svg className="slash-menu-search-icon" width="14" height="14" viewBox="0 0 15 15" fill="none">
          <path d="M10 6.5C10 8.43 8.43 10 6.5 10C4.57 10 3 8.43 3 6.5C3 4.57 4.57 3 6.5 3C8.43 3 10 4.57 10 6.5ZM9.5 10.5L12.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          placeholder="Pesquisar comandos..."
          className="slash-menu-desktop-search-input"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <kbd className="slash-menu-kbd">esc</kbd>
      </div>

      {/* Groups */}
      <div className="slash-menu-desktop-items">
        {filteredGroups.length === 0 ? (
          <div className="slash-menu-empty">
            <span>Sem resultados para &ldquo;{query}&rdquo;</span>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const groupStartIndex = flatFiltered.findIndex(i => i.id === group.items[0]?.id)
            return (
              <div key={group.id} className="slash-menu-group">
                <div className="slash-menu-group-label">{group.title}</div>
                {group.items.map((item, idx) => {
                  const globalIdx = groupStartIndex + idx
                  const isSelected = globalIdx === selectedIndex
                  return (
                    <button
                      key={item.id}
                      data-index={globalIdx}
                      className={`slash-menu-desktop-item ${isSelected ? 'slash-menu-item-selected' : ''}`}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <div className={`slash-menu-desktop-item-icon ${isSelected ? 'slash-menu-item-icon-selected' : ''}`}>
                        <item.icon size={15} />
                      </div>
                      <div className="slash-menu-desktop-item-content">
                        <span className="slash-menu-desktop-item-label">{item.label}</span>
                        <span className="slash-menu-desktop-item-desc">{item.description}</span>
                      </div>
                      {isSelected && (
                        <kbd className="slash-menu-enter-kbd">↵</kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="slash-menu-footer">
        <span><kbd className="slash-menu-kbd-sm">↑↓</kbd> navegar</span>
        <span><kbd className="slash-menu-kbd-sm">↵</kbd> inserir</span>
        <span><kbd className="slash-menu-kbd-sm">esc</kbd> fechar</span>
      </div>
    </div>
  )
}
