'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useBlockSelection } from '../block-selection-context'
import { useLongPress } from '@/hooks/use-long-press'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CalloutBlockView({ node, getPos, updateAttributes, editor }: { node: any, getPos: () => number | undefined, updateAttributes: any, editor: any }) {
  const { isBlockSelected, toggleBlock } = useBlockSelection()
  const { theme } = useTheme()
  const blockId = node.attrs.id
  const isSelected = blockId ? isBlockSelected(blockId) : false
  const [isOpen, setIsOpen] = useState(false)

  const longPressProps = useLongPress(() => {
    if (blockId) toggleBlock(blockId)
  }, { delay: 400 })

  return (
    <NodeViewWrapper
      {...longPressProps}
      className={cn(
        'group relative rounded-xl bg-amber-500/10 px-4 py-4 my-2 transition-colors',
        'dark:bg-[#3f3b23] dark:text-amber-50',
        getPos() === undefined ? 'opacity-50' : '',
        isSelected ? 'ring-2 ring-primary/30 shadow-sm' : ''
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0 text-xl leading-none select-none mt-1">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button" 
                className={cn(
                  "hover:bg-black/10 dark:hover:bg-white/10 rounded p-1 transition-colors flex items-center justify-center -ml-1 -mt-1 focus:outline-none",
                  !editor.isEditable ? "cursor-default" : "cursor-pointer"
                )}
                disabled={!editor.isEditable}
              >
                {node.attrs.emoji || '💡'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent" align="start">
              <EmojiPicker
                // @ts-expect-error valid prop values
                theme={theme === 'dark' ? 'dark' : 'light'}
                onEmojiClick={(emojiData) => {
                  updateAttributes({ emoji: emojiData.emoji })
                  setIsOpen(false)
                }}
                lazyLoadEmojis={true}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1 min-w-0">
          <NodeViewContent className="text-[15px] leading-relaxed w-full [&>*:first-child]:mt-0! [&>*:last-child]:mb-0!" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
