'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useBlockSelection } from '../block-selection-context';
import { useLongPress } from '@/hooks/use-long-press';
import { VerseSearchSheet } from '../modals/verse-search-sheet';
import { BookOpen } from 'lucide-react';
import { VERSE_SEARCH_EVENT } from '../block-menu';

interface VerseAttrs {
  id?: string;
  reference?: string;
  text?: string;
  version?: string;
}

interface VerseNode {
  attrs: VerseAttrs;
}

interface UpdateAttributes {
  (attrs: { reference?: string; text?: string; version?: string }): void;
}

export function VerseBlockView({
  node,
  getPos,
  updateAttributes,
  editor,
}: {
  node: VerseNode;
  getPos: () => number | undefined;
  updateAttributes: UpdateAttributes;
  editor: { isEditable: boolean };
}) {
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');
  const { reference, text, version } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isBlockSelected, toggleBlock } = useBlockSelection();
  const blockId = node.attrs.id as string | undefined;
  const isSelected = blockId ? isBlockSelected(blockId) : false;

  // Listen for verse search event from block menu
  useEffect(() => {
    const handleOpenSearch = () => {
      if (!reference) {
        setIsSearchOpen(true);
      }
    };
    window.addEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
    return () => window.removeEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
  }, [reference]);

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId);
  }, { delay: 400 });

  const handleClick = () => {
    if (!reference) {
      setIsSearchOpen(true);
    } else {
      setIsEditing(!isEditing);
    }
  };

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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <NodeViewWrapper
        {...longPressProps}
        className={cn(
          'group relative rounded-md border border-violet-200/40 bg-violet-500/5 px-4 py-3 my-3 transition-colors dark:border-violet-800/40 dark:bg-violet-500/10',
          getPos() === undefined ? 'opacity-50' : ''
        )}
        onClick={(e: React.MouseEvent) => {
          longPressProps.onClick(e);
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="shrink-0 pt-[2px] text-violet-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
              {t('verse.editing')}
            </div>
            <div className="mb-0.5 flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
              <span>{reference}</span>
              <span className="text-muted-foreground/60 font-normal">({version})</span>
            </div>
            <blockquote className="border-l-2 border-violet-300/50 pl-3 italic text-base text-foreground mb-1">
              {text}
            </blockquote>
          </div>
          <div className="shrink-0 space-x-2">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="default"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
            >
              {t('verse.search')}
            </Button>
          </div>
        </div>
        <VerseSearchSheet
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          onInsert={handleInsertVerse}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <>
      <NodeViewWrapper
        {...longPressProps}
        className={cn(
          'group relative rounded-md border border-violet-200/40 bg-violet-500/5 px-4 py-3 my-3 transition-colors dark:border-violet-800/40 dark:bg-violet-500/10 cursor-text',
          getPos() === undefined ? 'opacity-50' : ''
        )}
        onClick={(e: React.MouseEvent) => {
          longPressProps.onClick(e);
          handleClick();
        }}
      >
        <div className="flex items-start space-x-3">
          {!reference ? (
            <>
              <div className="shrink-0 pt-[2px] text-violet-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 mt-[2px]">
                <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
                  {t('blocks.verse')}
                </div>
                <div className="text-base text-muted-foreground italic font-medium">
                  {t('verse.search')}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 pt-[2px] text-violet-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-0.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
                  <span>{reference}</span>
                  <span className="text-violet-500/60 font-normal">({version})</span>
                </div>
                <blockquote className="border-l-2 border-violet-300/50 pl-3 italic text-base text-foreground">
                  {text}
                </blockquote>
              </div>
            </>
          )}
        </div>
      </NodeViewWrapper>
      <VerseSearchSheet
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onInsert={handleInsertVerse}
      />
    </>
  );
}