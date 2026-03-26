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
  const t = useTranslations('components.editor.verseSearchModal')
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
      setError(t('errors.emptyReference', { default: 'Por favor, insira uma referência' }))
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
      setVerseText(data.text || t('errors.verseNotFound', { default: 'Versículo não encontrado' }))
    } catch (err) {
      setError(t('errors.fetchFailed', { default: 'Falha ao buscar versículo' }))
      setVerseText('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = () => {
    if (!reference.trim() || !verseText) {
      setError(t('errors.verseRequired', { default: 'É necessário buscar um versículo primeiro' }))
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
          <DialogTitle>{t('title', { default: 'Buscar Versículo Bíblico' })}</DialogTitle>
          <DialogDescription>{t('description', { default: 'Insira a referência do versículo (ex: João 3:16)' })}</DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('reference', { default: 'Referência' })}</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('referencePlaceholder', { default: 'João 3:16' })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('version', { default: 'Versão' })}</label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('selectVersion', { default: 'Selecione uma versão' })} />
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
            {isLoading ? t('searching', { default: 'Buscando...' }) : t('search', { default: 'Buscar versículo' })}
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
            {t('cancel', { default: 'Cancelar' })}
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={isLoading || !reference.trim() || !verseText}
            className="ml-2"
          >
            {t('insert', { default: 'Inserir' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}