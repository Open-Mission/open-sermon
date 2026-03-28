'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'

export function LocaleSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleLocaleChange = async (newLocale: string) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    })
    router.refresh()
  }

  const locales = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ]

  const currentLocale = locales.find((l) => l.code === locale) || locales[0]

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
            <HugeiconsIcon icon={Globe02Icon} size={16} />
            <span>{currentLocale.label}</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('language', { defaultValue: 'Idioma' })}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {locales.map((l) => (
              <Button
                key={l.code}
                variant={locale === l.code ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 h-12 text-base"
                onClick={() => handleLocaleChange(l.code)}
              >
                <span className="text-xl">{l.flag}</span>
                {l.label}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2 hover:bg-accent/50 transition-colors">
          <span className="text-lg">{currentLocale.flag}</span>
          <span className="text-xs font-medium uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleLocaleChange(l.code)}
            className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            <span className="text-lg">{l.flag}</span>
            <span className="text-sm">{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
