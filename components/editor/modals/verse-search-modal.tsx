'use client';

import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { BookOpen } from 'lucide-react'

type VerseSearchModalProps = {
  onClose: () => void
  onInsert: (reference: string, text: string, version: string) => void
}

export function VerseSearchModal({ onClose, onInsert }: VerseSearchModalProps) {
  const t = useTranslations('editor.verse')
  const tCommon = useTranslations('common')
  const [reference, setReference] = useState('')
  const [version, setVersion] = useState('NVI')
  const [verseText, setVerseText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const versions = [
    { label: 'NVI', value: 'NVI' },
    { label: 'ARA', value: 'ARA' },
    { label: 'ARC', value: 'ARC' },
    { label: 'KJV', value: 'KJV' },
    { label: 'NIV', value: 'NIV' },
  ]

  const handleSearch = async () => {
    if (!reference.trim()) {
      setError(t('errors.emptyReference'))
      return
    }

    setIsLoading(true)
    setError(null)
    setVerseText('')

    try {
      const response = await fetch(`/api/bible?ref=${encodeURIComponent(reference)}&version=${version}`)
      if (!response.ok) {
        throw new Error('Failed to fetch verse')
      }
      
      const data = await response.json()
      setVerseText(data.text || t('errors.verseNotFound'))
    } catch {
      setError(t('errors.fetchFailed'))
      setVerseText('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = () => {
    if (!reference.trim() || !verseText) {
      setError(t('errors.verseRequired'))
      return
    }
    
    onInsert(reference, verseText, version)
    onClose()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('searchModal.title')}</DialogTitle>
          <DialogDescription>{t('searchModal.description')}</DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('reference')}</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('searchModal.referencePlaceholder')}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('version')}</label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('searchModal.selectVersion')} />
              </SelectTrigger>
              <SelectContent>
                {versions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isLoading || !reference.trim()}
            className="w-full disabled:opacity-50"
          >
            {isLoading ? t('searching') : t('search')}
          </button>
          
          {verseText && !isLoading && !error && (
            <div className="mt-4 p-4 bg-muted/50 border border-input rounded">
              <blockquote className="italic text-sm text-muted-foreground">
                {verseText}
              </blockquote>
              <div className="text-xs text-muted-foreground mt-2">
                <strong>{reference}</strong> ({version})
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={isLoading || !reference.trim() || !verseText}
            className="ml-2"
          >
            {t('searchModal.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}