"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share01Icon } from "@hugeicons/core-free-icons";
import { ShareSermonDialog } from "@/components/shared/share-sermon-dialog";

interface ShareButtonProps {
  sermonId: string;
  sermonTitle: string;
  isPublic: boolean;
  slug: string | null;
}

export function ShareButton({
  sermonId,
  sermonTitle,
  isPublic,
  slug,
}: ShareButtonProps) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Share01Icon} size={16} />
        <span className="hidden sm:inline">{t("share.button")}</span>
      </Button>
      <ShareSermonDialog
        open={open}
        onOpenChange={setOpen}
        sermonId={sermonId}
        sermonTitle={sermonTitle}
        isPublic={isPublic}
        existingSlug={slug}
      />
    </>
  );
}
