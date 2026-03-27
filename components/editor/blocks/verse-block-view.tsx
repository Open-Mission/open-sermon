'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useBlockSelection } from '../block-selection-context';
import { useLongPress } from '@/hooks/use-long-press';
import { VerseSearchSheet } from '../modals/verse-search-sheet';
import { VERSE_SEARCH_EVENT } from '../block-menu';

interface VerseAttrs {
  id?: string;
  reference?: string;
  text?: string;
  version?: string;
}

interface VerseNode {
  attrs: VerseAttrs;
  textContent: string;
  nodeSize: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}) {
  const t = useTranslations('editor');

  const { reference, text, version } = node.attrs;  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isBlockSelected, toggleBlock } = useBlockSelection();
  const blockId = node.attrs.id as string | undefined;
  const isSelected = blockId ? isBlockSelected(blockId) : false;

  useEffect(() => {
    const handleOpenSearch = () => {
      if (!reference) {
        setIsSearchOpen(true);
      }
    };
    window.addEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
    return () => window.removeEventListener(VERSE_SEARCH_EVENT, handleOpenSearch);
  }, [reference]);

  // Migrate old text attribute into interactive content if present
  useEffect(() => {
    if (text && node.textContent.trim() === '') {
      const pos = getPos();
      if (typeof pos === 'number' && editor.isEditable) {
        updateAttributes({ text: '' });
        const paragraphs = text.split('\n').map((line: string) => {
          const l = line.trim();
          return l ? editor.schema.nodes.paragraph.create(null, editor.schema.text(l)) : editor.schema.nodes.paragraph.create();
        });
        const tr = editor.state.tr;
        tr.replaceWith(pos + 1, pos + node.nodeSize - 1, paragraphs);
        editor.view.dispatch(tr);
      }
    }
  }, [text, node.textContent, getPos, editor, updateAttributes, node]);

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId);
  }, { delay: 400 });

  const handleInsertVerse = (
    newReference: string,
    newText: string,
    newVersion: string
  ) => {
    const pos = getPos();
    if (typeof pos !== 'number' || !editor.isEditable) return;

    // First update the reference and version
    updateAttributes({
      reference: newReference,
      version: newVersion,
      text: '', // clear old text attribute
    });

    // Replace the content with the new text using paragraphs
    const paragraphs = newText
      .split('\n')
      .map((line: string) => {
        const trLine = line.trim();
        if (trLine.length === 0) {
          return editor.schema.nodes.paragraph.create();
        }
        return editor.schema.nodes.paragraph.create(null, editor.schema.text(trLine));
      });

    const tr = editor.state.tr;
    tr.replaceWith(pos + 1, pos + node.nodeSize - 1, paragraphs);
    editor.view.dispatch(tr);

    setIsSearchOpen(false);
  };

  return (
    <NodeViewWrapper
      {...longPressProps}
      className={cn(
        'group relative my-4 border-l-4 border-violet-500/40 pl-4 py-1 transition-colors cursor-text',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'bg-violet-500/5 shadow-sm rounded-r-md' : ''
      )}
      onClick={longPressProps.onClick}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-violet-500/80">
          <div className="flex gap-2 items-center">
            <span>{reference || t('blocks.verse')}</span>
            {version && <span className="text-violet-500/60 font-normal">({version})</span>}
          </div>
          {!reference && (
            <Button variant="ghost" size="xs" onClick={() => setIsSearchOpen(true)} className="h-5 px-2 text-[10px]">
              {t('verse.search')}
            </Button>
          )}
        </div>
        <div className="text-foreground/90 text-base italic [&_p]:before:content-none [&_p]:after:content-none [&_blockquote]:border-none [&_blockquote]:pl-0 [&_p]:m-0! flex flex-col gap-2">
          <NodeViewContent className="[&>p:first-child]:mt-0" />
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