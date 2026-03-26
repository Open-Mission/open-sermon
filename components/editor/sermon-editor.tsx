import { useEditor, EditorContent } from '@tiptap/react'
import { useState, useCallback } from 'react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { IllustrationBlock } from './blocks/illustration-block'
import { ApplicationBlock } from './blocks/application-block'
import { PointBlock } from './blocks/point-block'
import { IntroBlock } from './blocks/intro-block'
import { ConclusionBlock } from './blocks/conclusion-block'
import { VerseBlock } from './blocks/verse-block'
import { VerseSearchModal } from './modals/verse-search-modal'
import { BlockMenu } from './block-menu'
import { useTranslations } from 'next-intl'

type JSONContent = {
  type: string
  content?: Array<JSONContent>
  attrs?: Record<string, any>
  [key: string]: any
}

type SermonEditorProps = {
  content?: JSONContent
  onChange: (content: JSONContent) => void
  editable?: boolean
}

export function SermonEditor({ content, onChange, editable = true }: SermonEditorProps) {
  const t = useTranslations('components.editor.sermonEditor')
  const [showModal, setShowModal] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  const editor = useEditor({
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t('placeholder', { default: "Digite '/' para inserir um bloco..." }),
      }),
      IllustrationBlock,
      ApplicationBlock,
      PointBlock,
      IntroBlock,
      ConclusionBlock,
      VerseBlock,
    ],
  })

  return (
    <div className="relative min-h-[300px]">
      <EditorContent editor={editor} className="min-h-[300px]" />
      <BlockMenu />
      {showModal && selectedBlock === 'verse' && (
        <VerseSearchModal
          onClose={() => {
            setShowModal(false)
            setSelectedBlock(null)
          }}
          onInsert={(reference, text, version) => {
            editor.chain()
              .focus()
              .insertContent({
                type: 'verseBlock',
                attrs: { reference, text, version },
              })
              .run()
            setShowModal(false)
            setSelectedBlock(null)
          }}
        />
      )}
    </div>
  )
}