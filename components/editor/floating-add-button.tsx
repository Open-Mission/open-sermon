'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { openBlockMenu } from './block-menu'
import { cn } from '@/lib/utils'

type FloatingAddButtonProps = {
  editor: unknown
}

export function FloatingAddButton({ editor }: FloatingAddButtonProps) {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile || !editor) return

    setIsVisible(true)
  }, [isMobile, editor])

  const handleOpenMenu = () => {
    openBlockMenu()
  }

  if (!isMobile || !isVisible) return null

  return (
    <button
      type="button"
      onClick={handleOpenMenu}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-200',
        'active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
      aria-label="Adicionar bloco"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}
