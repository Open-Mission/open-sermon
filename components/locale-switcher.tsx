'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

// --------------------------------------------------------
// Exemplo de uso do next-intl num componente client-side
// --------------------------------------------------------
export function LocaleSwitcher() {
  const t = useTranslations('common')
  const router = useRouter()

  const handleChange = (locale: string) => {
    // Troca o locale na URL mantendo o pathname
    document.cookie = `NEXT_LOCALE=${locale}; path=/`
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => handleChange('pt-BR')}>🇧🇷 PT</button>
      <button onClick={() => handleChange('en')}>🇺🇸 EN</button>
    </div>
  )
}

// --------------------------------------------------------
// Exemplo de uso em Server Component
// --------------------------------------------------------
// import { getTranslations } from 'next-intl/server'
//
// export default async function Page() {
//   const t = await getTranslations('dashboard')
//   return <h1>{t('title')}</h1>
// }
