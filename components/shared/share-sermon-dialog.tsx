"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Copy01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { publishSermon, unpublishSermon } from "@/lib/sermon-actions";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

interface ShareSermonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermonId: string;
  sermonTitle: string;
  isPublic: boolean;
  existingSlug: string | null;
}

export function ShareSermonDialog({
  open,
  onOpenChange,
  sermonId,
  sermonTitle,
  isPublic: initialIsPublic,
  existingSlug,
}: ShareSermonDialogProps) {
  const t = useTranslations();
  const [isPublic, setIsPublic] = React.useState(initialIsPublic);
  const [slug, setSlug] = React.useState(
    existingSlug || generateSlug(sermonTitle)
  );
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open && !existingSlug) {
      setSlug(generateSlug(sermonTitle));
    }
  }, [open, sermonTitle, existingSlug]);

  React.useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : `/s/${slug}`;

  const handlePublish = async () => {
    if (!slug.trim()) return;

    setIsPublishing(true);
    const result = await publishSermon(sermonId, slug.trim());
    setIsPublishing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsPublic(true);
      toast.success(t("share.published"));
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    const result = await unpublishSermon(sermonId);
    setIsPublishing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsPublic(false);
      toast.success(t("share.unpublished"));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("share.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} size={18} className="text-muted-foreground" />
            {t("share.title")}
          </DialogTitle>
          <DialogDescription>
            {t("share.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("share.slugLabel")}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap font-mono">
                /s/
              </span>
              <Input
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, "")
                  )
                }
                disabled={isPublic}
                className="font-mono text-sm"
                placeholder="sermon-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("share.shareLink")}
            </label>
            <div
              className={cn(
                "group flex items-center gap-0 rounded-lg border bg-muted/30 overflow-hidden transition-colors",
                copied && "border-green-500/50 bg-green-500/5"
              )}
            >
              <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 min-w-0">
                <HugeiconsIcon
                  icon={Link01Icon}
                  size={15}
                  className="text-muted-foreground shrink-0"
                />
                <span className="truncate text-sm font-mono text-foreground/80 select-all">
                  {shareUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-l transition-colors shrink-0",
                  copied
                    ? "text-green-600 bg-green-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <HugeiconsIcon
                  icon={Copy01Icon}
                  size={14}
                />
                {copied ? t("share.copiedBtn") : t("share.copy")}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          {!isPublic && (
            <p className="text-xs text-muted-foreground sm:mr-auto">
              {t("share.linkInactiveHint")}
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            {isPublic ? (
              <Button
                variant="outline"
                onClick={handleUnpublish}
                disabled={isPublishing}
                className="gap-1.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                {isPublishing ? t("common.loading") : t("share.unpublish")}
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !slug.trim()}
              >
                {isPublishing ? t("common.loading") : t("share.publish")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
