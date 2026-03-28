'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { VerseSearchSheet } from '../modals/verse-search-sheet';
import { VERSE_SEARCH_EVENT } from '../block-menu';
import { X, Quote, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VerseAttrs {
  reference?: string;
  text?: string;
  version?: string;
}

interface VerseNode {
  attrs: VerseAttrs;
}

export function InlineVerseView({
  node,
  updateAttributes,
  editor,
}: {
  node: VerseNode;
  getPos: () => number | undefined;
  updateAttributes: (attrs: VerseAttrs) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}) {
  const isMobile = useIsMobile();
  const { reference, text, version } = node.attrs;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => {
      if (!reference) {
        setIsSearchOpen(true);
      }
    };
    window.addEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
    return () => window.removeEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
  }, [reference]);

  const handleInsertVerse = (
    newReference: string,
    newText: string,
    newVersion: string
  ) => {
    updateAttributes({
      reference: newReference,
      text: newText,
      version: newVersion,
    });
    setIsSearchOpen(false);

    setTimeout(() => {
      editor.chain().focus().run();
    }, 10);
  };

  const displayText = reference || 'Pesquisar versículo...';

  // Desktop: right-side panel layout — 3-zone structure (header / scroll body / footer)
  const sheetBody = (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="shrink-0 px-8 pt-10 pb-6 border-b border-border/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/5 text-primary/50 border border-primary/10">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              {version && (
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50 border border-border/30 px-2 py-0.5 rounded-full bg-secondary/50">
                  {version}
                </span>
              )}
            </div>
            <h2 className="text-4xl font-heading font-bold tracking-tight text-foreground leading-[1.05]">
              {reference}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsViewOpen(false)}
            className="shrink-0 rounded-full h-9 w-9 text-muted-foreground/40 hover:text-foreground hover:bg-secondary mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable scripture body */}
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent selection:bg-primary/10">
        <div className="flex flex-col gap-6">
          <Quote className="w-8 h-8 text-primary/10 -rotate-12 shrink-0" />
          <blockquote className="text-xl leading-[1.75] text-foreground font-serif italic whitespace-pre-wrap">
            {text}
          </blockquote>
        </div>
      </div>

      {/* Fixed footer branding */}
      <div className="shrink-0 px-8 py-5 border-t border-border/10 flex items-center gap-3">
        <div className="flex items-center gap-1.5 opacity-20">
          <div className="w-1 h-1 rounded-full bg-foreground" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1 h-1 rounded-full bg-foreground" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground/30">
          Open Sermon
        </span>
      </div>
    </div>
  );

  // Mobile: vertical centered layout for Drawer
  const mobileBody = (
    <div className="flex flex-col gap-8 py-2 selection:bg-primary/10">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-2 rounded-xl bg-primary/5 text-primary/60 border border-primary/10 shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-heading font-bold tracking-tight text-foreground">
            {reference}
          </h2>
          {version && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground border border-border/40">
              <span className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
              {version}
            </div>
          )}
        </div>
        <div className="w-12 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="relative group w-full">
        <Quote className="w-8 h-8 text-primary/10 mb-6 -rotate-12 transition-transform group-hover:rotate-0 duration-500" />
        <blockquote className="text-lg leading-[1.65] text-foreground font-serif italic whitespace-pre-wrap text-left w-full">
          {text}
        </blockquote>
      </div>
      <div className="flex flex-col items-center gap-3 pt-8 border-t border-border/10">
        <div className="flex items-center gap-2 opacity-20">
          <div className="w-1 h-1 rounded-full bg-foreground" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1 h-1 rounded-full bg-foreground" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground/30">
          Open Sermon Reader
        </span>
      </div>
    </div>
  );

  return (
    <NodeViewWrapper as="span" className="inline-block mx-0.5 align-baseline">
      {!reference ? (
        <span
          onClick={() => setIsSearchOpen(true)}
          className="text-primary font-serif italic cursor-pointer underline decoration-primary/20 underline-offset-[3px] hover:decoration-primary/60 hover:text-primary/80 rounded-sm px-0.5 transition-all duration-200"
        >
          {displayText}
        </span>
      ) : isMobile ? (
        <>
          <span
            onClick={() => setIsViewOpen(true)}
            className="text-primary font-serif italic cursor-pointer underline decoration-primary/20 underline-offset-[3px] hover:decoration-primary/60 hover:text-primary/80 rounded-sm px-0.5 transition-all duration-200"
          >
            {displayText}
          </span>
          <Drawer open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DrawerContent className="min-h-[90vh] max-h-[90vh] bg-background">
              <DrawerHeader className="text-left border-b border-border/40 pb-4 px-6 shrink-0">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                    Leitura de Texto
                  </DrawerTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsViewOpen(false)}
                    className="rounded-full h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DrawerDescription className="sr-only">
                  Visualização do versículo {reference}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-6 pb-20 pt-8 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out">
                  {mobileBody}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <>
          <span
            onClick={() => setIsViewOpen(true)}
            className="text-primary font-serif italic cursor-pointer underline decoration-primary/20 underline-offset-[3px] hover:decoration-primary/60 rounded-sm px-0.5 transition-all duration-200"
          >
            {displayText}
          </span>
          <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
            <SheetContent
              side="right"
              showCloseButton={false}
              className={cn(
                'w-[480px] sm:max-w-[480px] p-0 border-l border-border/30',
                'bg-background/95 backdrop-blur-2xl',
                'shadow-[-32px_0_64px_-16px_rgba(0,0,0,0.15)]'
              )}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>{reference}</SheetTitle>
                <SheetDescription>Visualização do versículo {reference}</SheetDescription>
              </SheetHeader>
              <div className="animate-in fade-in-0 slide-in-from-right-8 duration-500 ease-out h-full relative overflow-hidden">
                {sheetBody}
                {/* Ambient glow */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/3 rounded-full blur-[120px]" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}

      <VerseSearchSheet
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onInsert={handleInsertVerse}
      />
    </NodeViewWrapper>
  );
}
