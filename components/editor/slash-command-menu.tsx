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
  Heading1,
  Heading2,
  Heading3,
  MessageSquare,
  Quote,
  Hash,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
} from '@/components/ui/drawer'
import { dispatchVerseSearchEvent } from './block-menu'
import { cn } from '@/lib/utils'

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

// ─── Constants ─────────────────────────────────────────────────────────────

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

// ─── Components ─────────────────────────────────────────────────────────────

const CommandList = ({ 
  groups, 
  flatFiltered, 
  selectedIndex, 
  isMobile, 
  onSelect, 
  onHover,
  itemRefs 
}: { 
  groups: CommandGroup[], 
  flatFiltered: CommandItem[], 
  selectedIndex: number, 
  isMobile: boolean, 
  onSelect: (item: CommandItem) => void,
  onHover: (index: number) => void,
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
}) => {
  if (groups.length === 0) {
    return (
      <div className={cn(
        "text-center text-muted-foreground",
        isMobile ? "py-12 animate-in fade-in zoom-in-95" : "px-3 py-6 text-sm"
      )}>
        <Search className="mx-auto h-8 w-8 mb-3 opacity-20" />
        <p>Nenhum resultado</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "space-y-6",
      !isMobile && "max-h-[min(400px,80vh)] overflow-y-auto p-1.5 custom-scrollbar"
    )}>
      {groups.map((group) => {
        const groupStartIndex = flatFiltered.findIndex(i => i.id === group.items[0]?.id)
        return (
          <div key={group.id} className={cn("space-y-2", !isMobile && "mb-2 last:mb-0")}>
            <div className={cn(
              "px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
              !isMobile && "py-1.5 text-muted-foreground/70"
            )}>
              {group.title}
            </div>
            <div className={cn(
              isMobile ? "grid grid-cols-2 gap-2" : "space-y-0.5"
            )}>
              {group.items.map((item, idx) => {
                const globalIdx = groupStartIndex + idx
                const isSelected = globalIdx === selectedIndex
                
                if (isMobile) {
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200",
                        isSelected 
                          ? "bg-primary/10 border-primary/20 shadow-sm" 
                          : "bg-secondary/20 border-transparent active:scale-95 active:bg-secondary/40"
                      )}
                      onClick={() => onSelect(item)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                      )}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground">{item.label}</span>
                    </button>
                  )
                }

                return (
                  <button
                    ref={el => { itemRefs.current[globalIdx] = el }}
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-75",
                      isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => onHover(globalIdx)}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-md shrink-0",
                      isSelected ? "bg-background/20" : "bg-muted"
                    )}>
                      <item.icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate leading-tight">
                        {item.label}
                      </span>
                      {!isSelected && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────────

export function SlashCommandMenu({ editor }: { editor: Editor | null }) {
  const t = useTranslations('editor')
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [range, setRange] = useState<{ from: number; to: number } | null>(null)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // ─── Commands definition ────────────────────────────

  const COMMAND_GROUPS = useMemo<CommandGroup[]>(() => [
    {
      id: 'basic',
      title: 'Básico',
      items: [
        {
          id: 'text',
          label: 'Texto',
          description: 'Comece a escrever com texto simples.',
          icon: Type,
          keywords: ['p', 'paragrafo', 'texto'],
          group: 'basic',
          command: (e) => e.chain().focus().setParagraph().run(),
        },
        {
          id: 'h1',
          label: 'Título 1',
          description: 'Título de seção grande.',
          icon: Heading1,
          keywords: ['h1', 'titulo', 'grande'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          id: 'h2',
          label: 'Título 2',
          description: 'Título de seção médio.',
          icon: Heading2,
          keywords: ['h2', 'titulo', 'medio'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          id: 'h3',
          label: 'Título 3',
          description: 'Título de seção pequeno.',
          icon: Heading3,
          keywords: ['h3', 'titulo', 'pequeno'],
          group: 'basic',
          command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ],
    },
    {
      id: 'scripture',
      title: 'Escrituras',
      items: [
        {
          id: 'verse',
          label: 'Versículo',
          description: 'Insira um bloco de versículo bíblico.',
          icon: BookOpen,
          keywords: ['biblia', 'versiculo', 'bloco'],
          group: 'scripture',
          command: (e) => {
             e.chain().focus().insertContent([
              { 
                type: 'verseBlock', 
                attrs: { reference: '', text: '', version: 'NVI' },
                content: [{ type: 'paragraph' }]
              },
              { type: 'paragraph' }
            ]).run()
            dispatchVerseSearchEvent()
          },
        },
        {
          id: 'inline-verse',
          label: 'Versículo Inline',
          description: 'Insira um versículo dentro do texto.',
          icon: Quote,
          keywords: ['biblia', 'versiculo', 'inline', 'texto'],
          group: 'scripture',
          command: (e) => {
            e.chain().focus().insertContent([
              { 
                type: 'inlineVerse', 
                attrs: { reference: '', text: '', version: 'NVI' },
              },
            ]).run()
            dispatchVerseSearchEvent()
          },
        },
      ],
    },
    {
      id: 'blocks',
      title: 'Blocos de Estudo',
      items: [
        {
          id: 'callout',
          label: 'Callout',
          description: 'Destaque uma informação importante.',
          icon: MessageSquare,
          keywords: ['callout', 'destaque', 'info'],
          group: 'blocks',
          command: (e) => e.chain().focus().insertContent({ type: 'calloutBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'illustration',
          label: 'Ilustração',
          description: 'Uma história ou exemplo ilustrativo.',
          icon: Lightbulb,
          keywords: ['ilustracao', 'exemplo', 'historia'],
          group: 'blocks',
          command: (e) => e.chain().focus().insertContent({ type: 'illustrationBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'application',
          label: 'Aplicação',
          description: 'Como aplicar esse ensino na vida.',
          icon: Target,
          keywords: ['aplicacao', 'pratica', 'vida'],
          group: 'blocks',
          command: (e) => e.chain().focus().insertContent({ type: 'applicationBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'point',
          label: 'Ponto Principal',
          description: 'Um dos pontos principais da mensagem.',
          icon: Pin,
          keywords: ['ponto', 'principal', 'topico'],
          group: 'blocks',
          command: (e) => e.chain().focus().insertContent({ type: 'pointBlock', content: [{ type: 'paragraph' }] }).run(),
        },
      ],
    },
    {
      id: 'structure',
      title: 'Estrutura',
      items: [
        {
          id: 'intro',
          label: 'Introdução',
          description: 'Início da sua mensagem.',
          icon: PlayCircle,
          keywords: ['inicio', 'introducao', 'start'],
          group: 'structure',
          command: (e) => e.chain().focus().insertContent({ type: 'introBlock', content: [{ type: 'paragraph' }] }).run(),
        },
        {
          id: 'conclusion',
          label: 'Conclusão',
          description: 'Encerramento e apelo.',
          icon: CheckCircle,
          keywords: ['fim', 'conclusao', 'encerramento'],
          group: 'structure',
          command: (e) => e.chain().focus().insertContent({ type: 'conclusionBlock', content: [{ type: 'paragraph' }] }).run(),
        },
      ],
    },
  ], [])

  // ─── Filtering logic ───────────────────────────────

  const filteredGroups = useMemo(() => {
    if (!query) return COMMAND_GROUPS
    
    return COMMAND_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      )
    })).filter(group => group.items.length > 0)
  }, [query, COMMAND_GROUPS])

  const flatFiltered = useMemo(() => 
    filteredGroups.flatMap(g => g.items), 
    [filteredGroups]
  )

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setSelectedIndex(0)
  }, [])

  // ─── Handlers ──────────────────────────────────────

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const executeCommand = useCallback((item: CommandItem) => {
    if (!editor) return

    // Delete the '/' and the query
    if (range) {
      editor.chain().focus().deleteRange(range).run()
    } else {
      // Fallback
      editor.chain().focus().deleteRange({
        from: editor.state.selection.from - 1 - query.length,
        to: editor.state.selection.from
      }).run()
    }

    item.command(editor, range || undefined)
    closeMenu()
  }, [editor, query, range, closeMenu])

  // ─── Events ────────────────────────────────────────

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

    const handleClose = () => closeMenu()
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

  // Scroll selected item into view on desktop
  useEffect(() => {
    if (isOpen && !isMobile && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedIndex, isOpen, isMobile])

  // Keyboard navigation (Desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % flatFiltered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + flatFiltered.length) % flatFiltered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selectedItem = flatFiltered[selectedIndex]
        if (selectedItem) executeCommand(selectedItem)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isMobile, flatFiltered, selectedIndex, executeCommand, closeMenu])

  // Close on outside click (Desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isMobile, closeMenu])

  // ─── Render ─────────────────────────────────────────

  if (!isOpen) return null

  // ─── Mobile bottom sheet ────────────────────────────
  if (isMobile) {
    return (
      <Drawer 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) closeMenu()
        }}
      >
        <DrawerContent className="pb-8 max-h-[92vh]">
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />

          {/* Header */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold">
                /
              </div>
              <h2 className="text-xl font-bold">Comandos</h2>
            </div>

            {/* Search */}
            <div className="relative mb-4 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Pesquisar comandos..."
                className="w-full h-11 bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl pl-10 pr-4 text-base outline-none transition-all"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" 
                  onClick={() => handleQueryChange('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <DrawerDescription className="sr-only">
            Selecione um bloco ou comando para inserir no editor
          </DrawerDescription>

          <div ref={menuRef} className="px-3 pb-4 overflow-y-auto">
            <CommandList 
              groups={filteredGroups}
              flatFiltered={flatFiltered}
              selectedIndex={selectedIndex}
              isMobile={isMobile}
              onSelect={executeCommand}
              onHover={setSelectedIndex}
              itemRefs={itemRefs}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // ─── Desktop floating menu ──────────────────────────
  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-background border border-border/50 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <CommandList 
        groups={filteredGroups}
        flatFiltered={flatFiltered}
        selectedIndex={selectedIndex}
        isMobile={isMobile}
        onSelect={executeCommand}
        onHover={setSelectedIndex}
        itemRefs={itemRefs}
      />
    </div>
  )
}
