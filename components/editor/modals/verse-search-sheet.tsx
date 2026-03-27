'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { BookOpen, Loader2, Search, Pencil } from 'lucide-react';

const VERSIONS = [
  { value: 'NVI', label: 'NVI' },
  { value: 'ARA', label: 'ARA' },
  { value: 'ACF', label: 'ACF' },
  { value: 'NTLH', label: 'NTLH' },
] as const;

type Version = (typeof VERSIONS)[number]['value'];

interface VerseSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (reference: string, text: string, version: string) => void;
}

export function VerseSearchSheet({
  open,
  onOpenChange,
  onInsert,
}: VerseSearchSheetProps) {
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');
  const isMobile = useIsMobile();

  // Search tab state
  const [input, setInput] = React.useState('');
  const [verseText, setVerseText] = React.useState('');
  const [reference, setReference] = React.useState('');

  // Manual tab state
  const [manualReference, setManualReference] = React.useState('');
  const [manualText, setManualText] = React.useState('');

  const [version, setVersion] = React.useState<Version>('NVI');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('search');

  const handleSearch = async () => {
    if (!input.trim()) {
      setError(t('verse.errors.emptyReference'));
      return;
    }

    setIsParsing(true);
    setIsLoading(true);
    setError(null);
    setVerseText('');

    try {
      const parseRes = await fetch('/api/ai/verse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!parseRes.ok) {
        const parseData = await parseRes.json();
        setError(parseData.error || t('verse.errors.verseNotFound'));
        setIsParsing(false);
        setIsLoading(false);
        return;
      }

      const { reference: normalizedRef } = await parseRes.json();
      setReference(normalizedRef);
      setIsParsing(false);

      const verseRes = await fetch(
        `/api/bible?ref=${encodeURIComponent(normalizedRef)}&version=${version}`
      );

      if (!verseRes.ok) {
        setError(t('verse.errors.fetchFailed'));
        return;
      }

      const verseData = await verseRes.json();

      if (!verseData.text) {
        setError(t('verse.errors.verseNotFound'));
        return;
      }

      setVerseText(verseData.text);
    } catch {
      setError(t('verse.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSearch = () => {
    if (!reference || !verseText) {
      setError(t('verse.errors.verseRequired'));
      return;
    }

    onInsert(reference, verseText, version);
    handleClose();
  };

  const handleInsertManual = () => {
    if (!manualReference.trim() || !manualText.trim()) {
      setError(t('verse.errors.verseRequired'));
      return;
    }

    onInsert(manualReference.trim(), manualText.trim(), version);
    handleClose();
  };

  const handleClose = () => {
    setInput('');
    setVerseText('');
    setReference('');
    setManualReference('');
    setManualText('');
    setError(null);
    setActiveTab('search');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && activeTab === 'search') {
      e.preventDefault();
      handleSearch();
    }
  };

  const searchContent = (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('verse.searchModal.referencePlaceholder')}
            className="pr-10 select-none"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleSearch}
            disabled={isLoading || !input.trim()}
          >
            {isLoading && isParsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('verse.version')}
          </label>
          <ToggleGroup
            type="single"
            value={version}
            onValueChange={(v) => v && setVersion(v as Version)}
            variant="outline"
            className="flex-wrap justify-start"
          >
            {VERSIONS.map((v) => (
              <ToggleGroupItem key={v.value} value={v.value} className="px-4">
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {isLoading && !isParsing && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {verseText && !isLoading && !error && (
          <div className="rounded-md border border-input bg-muted/30 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-500/80">
              {reference}
            </div>
            <blockquote className="border-l-2 border-violet-300/50 pl-3 text-sm italic text-foreground">
              {verseText}
            </blockquote>
            <div className="mt-2 text-xs text-muted-foreground">{version}</div>
          </div>
        )}
      </div>
    </>
  );

  const manualContent = (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('verse.searchModal.referenceLabel')}
          </label>
          <Input
            value={manualReference}
            onChange={(e) => setManualReference(e.target.value)}
            placeholder={t('verse.searchModal.manualReferencePlaceholder')}
            className="select-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('verse.version')}
          </label>
          <ToggleGroup
            type="single"
            value={version}
            onValueChange={(v) => v && setVersion(v as Version)}
            variant="outline"
            className="flex-wrap justify-start"
          >
            {VERSIONS.map((v) => (
              <ToggleGroupItem key={v.value} value={v.value} className="px-4">
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('verse.searchModal.verseText')}
          </label>
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={t('verse.searchModal.manualTextPlaceholder')}
            rows={4}
            className="select-none resize-none"
          />
        </div>
      </div>
    </>
  );

  const tabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t('verse.searchModal.tabSearch')}
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          {t('verse.searchModal.tabManual')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="search" className="mt-4">
        {searchContent}
      </TabsContent>
      <TabsContent value="manual" className="mt-4">
        {manualContent}
      </TabsContent>
    </Tabs>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              {t('verse.searchModal.title')}
            </SheetTitle>
            <SheetDescription>{t('verse.searchModal.description')}</SheetDescription>
          </SheetHeader>
          <div className="py-4">{tabs}</div>
          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              {tCommon('cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={activeTab === 'search' ? handleInsertSearch : handleInsertManual}
              disabled={
                activeTab === 'search'
                  ? !reference || !verseText || isLoading
                  : !manualReference.trim() || !manualText.trim()
              }
            >
              {t('verse.searchModal.insert')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-500" />
            {t('verse.searchModal.title')}
          </DialogTitle>
          <DialogDescription>{t('verse.searchModal.description')}</DialogDescription>
        </DialogHeader>
        <div className="py-2">{tabs}</div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={activeTab === 'search' ? handleInsertSearch : handleInsertManual}
            disabled={
              activeTab === 'search'
                ? !reference || !verseText || isLoading
                : !manualReference.trim() || !manualText.trim()
            }
          >
            {t('verse.searchModal.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
