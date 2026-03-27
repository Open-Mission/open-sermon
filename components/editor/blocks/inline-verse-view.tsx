'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { VerseSearchSheet } from '../modals/verse-search-sheet';
import { VERSE_SEARCH_EVENT } from '../block-menu';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const viewContent = (
    <div className="flex flex-col gap-8 relative">
      {/* Decorative cross watermark */}
      <div className="absolute -top-4 -right-4 w-24 h-24 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor" className="text-amber-900 w-full h-full">
          <path d="M11 2v7H4v2h7v11h2V11h7V9h-7V2z"/>
        </svg>
      </div>

      {/* Reference header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          {/* Illuminated initial */}
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-linear-to-br from-amber-50 to-amber-100/50 border border-amber-200/30 shadow-sm">
            
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-serif tracking-tight text-amber-900 leading-none">
              {reference}
            </h3>
            {version && (
              <span className="text-[10px] font-medium text-amber-600/70 uppercase tracking-[0.15em]">
                {version}
              </span>
            )}
          </div>
        </div>
        
        {/* Ornamental line */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px flex-1 bg-linear-to-r from-amber-300/40 via-amber-200/20 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300/50" />
        </div>
      </div>
      
      {/* Verse text */}
      <div className="relative py-1">
        {/* Decorative quotation marks */}
        <div className="absolute -top-2 -left-1 flex flex-col gap-0.5 opacity-20">
          <span className="text-4xl font-serif text-amber-600 leading-none select-none">&ldquo;</span>
        </div>
        
        <blockquote className="text-lg md:text-xl leading-relaxed text-foreground whitespace-pre-wrap pl-5 border-l-[3px] border-amber-300/40 font-serif italic">
          {text}
        </blockquote>
        
        {/* Closing quote */}
        <div className="absolute -bottom-3 -right-1 opacity-20">
          <span className="text-4xl font-serif text-amber-600 leading-none select-none">&rdquo;</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-2">
        <div className="flex items-center gap-1.5 opacity-40">
          <div className="w-3 h-px bg-amber-600/50" />
          <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-amber-700">
            Open Sermon
          </span>
          <div className="w-3 h-px bg-amber-600/50" />
        </div>
        
        {/* Decorative corner flourish */}
        <svg className="w-6 h-6 text-amber-300/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 22C2 17 7 12 12 12C17 12 22 7 22 2" />
        </svg>
      </div>
    </div>
  );

  return (
    <NodeViewWrapper as="span" className="inline-block mx-0.5 align-baseline">
      {!reference ? (
        <span 
          onClick={() => setIsSearchOpen(true)}
          className="text-amber-700 font-serif italic cursor-pointer underline decoration-amber-400/40 underline-offset-[3px] hover:decoration-amber-500/70 hover:text-amber-800 rounded-sm px-0.5 transition-all duration-200"
        >
          {displayText}
        </span>
      ) : isMobile ? (
        <>
          <span 
            onClick={() => setIsViewOpen(true)}
            className="text-amber-700 font-serif italic cursor-pointer underline decoration-amber-400/40 underline-offset-[3px] hover:decoration-amber-500/70 hover:text-amber-800 rounded-sm px-0.5 transition-all duration-200"
          >
            {displayText}
          </span>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Drawer open={isViewOpen} onOpenChange={setIsViewOpen} onDrag={true as any}>
            <DrawerContent className="min-h-[85vh] max-h-[85vh]">
              <DrawerHeader className="text-left border-b border-amber-200/30 pb-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-xs font-medium uppe  rcase tracking-[0.2em] text-amber-700/70">
                    Leitura
                  </DrawerTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setIsViewOpen(false)} className="text-amber-600/60 hover:text-amber-700 hover:bg-amber-100/50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DrawerDescription className="sr-only">Texto do versículo {reference}</DrawerDescription>
              </DrawerHeader>
              <div className="px-6 pb-32 pt-6 overflow-y-auto">
                {viewContent}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <span 
            onClick={() => setIsViewOpen(true)}
            className="text-amber-700 font-serif italic cursor-pointer underline decoration-amber-400/40 underline-offset-[3px] hover:decoration-amber-500/70 rounded-sm px-0.5 transition-all duration-200"
          >
            {displayText}
          </span>
          <DialogContent className="max-w-2xl p-8 border-amber-200/30 shadow-2xl bg-background backdrop-blur-sm overflow-hidden" showCloseButton={true}>
            <DialogHeader className="sr-only">
               <DialogTitle>{reference}</DialogTitle>
            </DialogHeader>
            <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-400 ease-out text-foreground">
              {viewContent}
            </div>
            
            {/* Subtle parchment texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-multiply" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%'25 height='100%'25 filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />
            
            {/* Decorative corner ornaments */}
            <div className="absolute top-4 left-4 w-8 h-8 opacity-10">
              <svg viewBox="0 0 32 32" className="w-full h-full text-amber-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M2 16 Q8 12, 16 2" />
                <path d="M2 16 Q8 20, 16 30" />
              </svg>
            </div>
            <div className="absolute bottom-4 right-4 w-8 h-8 opacity-10 rotate-180">
              <svg viewBox="0 0 32 32" className="w-full h-full text-amber-700" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M2 16 Q8 12, 16 2" />
                <path d="M2 16 Q8 20, 16 30" />
              </svg>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <VerseSearchSheet
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onInsert={handleInsertVerse}
      />
    </NodeViewWrapper>
  );
}
