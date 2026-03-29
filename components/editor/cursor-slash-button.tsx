'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { Plus } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { openSlashMenu } from './slash-command-menu'
import { OPEN_BLOCK_MENU_EVENT } from './block-menu'
import { cn } from '@/lib/utils'

type CursorSlashButtonProps = {
  editor: Editor | null
}

export function CursorSlashButton({ editor }: CursorSlashButtonProps) {
  const isMobile = useIsMobile()
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPosRef = useRef<number | null>(null)

  const updatePosition = useCallback(() => {
    if (!editor || editor.isDestroyed) return

    const { from, empty } = editor.state.selection

    if (!empty) {
      setIsVisible(false)
      return
    }

    const $pos = editor.state.doc.resolve(from)
    const node = $pos.node()

    const isEmptyParagraph = 
      node.type.name === 'paragraph' && 
      node.content.size === 0

    const isAtLineStart = $pos.parentOffset === 0

    if (!isEmptyParagraph && !isAtLineStart) {
      setShouldShow(false)
      setIsVisible(false)
      return
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    lastPosRef.current = from

    try {
      const coords = editor.view.coordsAtPos(from)
      const editorEl = editor.view.dom
      const editorRect = editorEl.getBoundingClientRect()

      if (coords.left < editorRect.left - 50 || coords.left > editorRect.right + 50) {
        setShouldShow(false)
        setIsVisible(false)
        return
      }

      const scrollY = window.scrollY
      const scrollX = window.scrollX

      setPosition({
        top: coords.top + scrollY - 10,
        left: coords.left + scrollX - 44,
      })
      setShouldShow(true)
      setIsVisible(true)
    } catch {
      setShouldShow(false)
      setIsVisible(false)
    }
  }, [editor])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    updatePosition()

    const handleUpdate = () => {
      requestAnimationFrame(updatePosition)
    }

    const handleBlur = () => {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 150)
    }

    const handleFocus = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      updatePosition()
    }

    const handleScroll = () => {
      if (isVisible) {
        requestAnimationFrame(updatePosition)
      }
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)
    editor.on('focus', handleFocus)
    editor.on('blur', handleBlur)

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
      editor.off('focus', handleFocus)
      editor.off('blur', handleBlur)
      window.removeEventListener('scroll', handleScroll)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [editor, updatePosition, isVisible])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!editor || editor.isDestroyed) return

    editor.commands.focus()

    const { from } = editor.state.selection
    const coords = editor.view.coordsAtPos(from)
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    if (isMobile) {
      window.dispatchEvent(new CustomEvent(OPEN_BLOCK_MENU_EVENT))
    } else {
      openSlashMenu(
        { top: coords.top + scrollY + 24, left: coords.left + scrollX },
        { from, to: from }
      )
    }
  }, [editor, isMobile])

  if (!editor || !shouldShow || !position) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current)
          hideTimeoutRef.current = null
        }
      }}
      className={cn(
        'fixed z-40',
        'flex items-center justify-center',
        'w-7 h-7 rounded-md',
        'bg-muted/80 backdrop-blur-sm border border-border/50',
        'text-muted-foreground',
        'transition-all duration-150',
        'hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-md',
        'active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-1 pointer-events-none'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      aria-label="Adicionar bloco"
      title="Clique para adicionar um bloco"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </button>
  )
}
