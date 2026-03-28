"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { useTranslations } from "next-intl";
import { IllustrationBlock } from "@/components/editor/blocks/illustration-block";
import { ApplicationBlock } from "@/components/editor/blocks/application-block";
import { PointBlock } from "@/components/editor/blocks/point-block";
import { IntroBlock } from "@/components/editor/blocks/intro-block";
import { ConclusionBlock } from "@/components/editor/blocks/conclusion-block";
import { VerseBlock } from "@/components/editor/blocks/verse-block";
import { CalloutBlock } from "@/components/editor/blocks/callout-block";
import { InlineVerse } from "@/components/editor/blocks/inline-verse";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type JSONContent = {
  type: string;
  content?: Array<JSONContent>;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
};

interface PublicSermonViewerProps {
  title: string;
  blocks: unknown;
  mainScripture: string | null;
  type: string;
  preachedAt: string | null;
}

export function PublicSermonViewer({
  title,
  blocks,
  mainScripture,
  type,
  preachedAt,
}: PublicSermonViewerProps) {
  const t = useTranslations("publicSermon");
  const common = useTranslations("common");
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      CalloutBlock,
      IllustrationBlock,
      ApplicationBlock,
      PointBlock,
      IntroBlock,
      ConclusionBlock,
      VerseBlock,
      InlineVerse,
    ],
    editorProps: {
      attributes: {
        class:
          "max-w-none prose dark:prose-invert prose-lg focus:outline-none",
      },
    },
    content:
      blocks && typeof blocks === "object" && (blocks as JSONContent).type
        ? blocks
        : undefined,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto px-6 h-14 flex items-center justify-end">
          <Button asChild size="sm">
            <Link href="/register">{t("createAccount")}</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24 w-full">
        <div className="mb-12">
          {type && (
            <span className="inline-block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              {type}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h1>
          {mainScripture && (
            <p className="text-lg text-muted-foreground italic">
              {mainScripture}
            </p>
          )}
          {preachedAt && (
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(preachedAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-6 h-px bg-border" />
        </div>

        <EditorContent editor={editor} />
      </main>

      <footer className="pt-4 pb-8">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <p>
            {t("preparedWith")}{" "}
            <Link href="/" className="font-medium text-foreground hover:underline">
              {common("appName")}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
