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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Copy01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { publishSermon, unpublishSermon } from "@/lib/sermon-actions";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShareSermonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermonId: string;
  sermonTitle: string;
  isPublic: boolean;
  existingSlug: string | null;
}

function ShareContent({
  sermonId,
  sermonTitle,
  initialIsPublic,
  existingSlug,
  onOpenChange,
}: Omit<ShareSermonDialogProps, "open"> & {
  initialIsPublic: boolean;
}) {
  const t = useTranslations();
  const [isPublic, setIsPublic] = React.useState(initialIsPublic);
  const [slug, setSlug] = React.useState(
    existingSlug || generateSlug(sermonTitle),
  );
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!existingSlug) {
      setSlug(generateSlug(sermonTitle));
    }
  }, [sermonTitle, existingSlug]);

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
    <>
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
                    .replace(/^-|-$/g, ""),
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
              copied && "border-green-500/50 bg-green-500/5",
            )}
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0">
              <HugeiconsIcon
                icon={Link01Icon}
                size={14}
                className="text-muted-foreground shrink-0"
              />
              <span className="truncate text-xs font-mono text-foreground/70 select-all">
                {shareUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-l transition-colors shrink-0",
                copied
                  ? "text-green-600 bg-green-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <HugeiconsIcon
                icon={copied ? Tick01Icon : Copy01Icon}
                size={13}
              />
              {copied ? t("share.copiedBtn") : t("share.copy")}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-6">
        {!isPublic && (
          <p className="text-xs text-muted-foreground">
            {t("share.linkInactiveHint")}
          </p>
        )}
        {isPublic ? (
          <Button
            variant="outline"
            onClick={handleUnpublish}
            disabled={isPublishing}
            className="gap-1.5 ml-auto"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
            {isPublishing ? t("common.loading") : t("share.unpublish")}
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !slug.trim()}
            className="ml-auto"
          >
            {isPublishing ? t("common.loading") : t("share.publish")}
          </Button>
        )}
      </div>
    </>
  );
}

function MobileSheet({ open, onOpenChange, ...rest }: ShareSermonDialogProps) {
  const t = useTranslations();
  const [copied, setCopied] = React.useState(false);

  const slug = rest.existingSlug || generateSlug(rest.sermonTitle);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : `/s/${slug}`;

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-2">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/20" />
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon
              icon={Link01Icon}
              size={18}
              className="text-muted-foreground"
            />
            {t("share.title")}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {t("share.description")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <ShareContent
            {...rest}
            initialIsPublic={rest.isPublic}
            onOpenChange={onOpenChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopDialog({
  open,
  onOpenChange,
  ...rest
}: ShareSermonDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="" style={{ maxWidth: "640px" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Link01Icon}
              size={18}
              className="text-muted-foreground"
            />
            {t("share.title")}
          </DialogTitle>
          <DialogDescription>{t("share.description")}</DialogDescription>
        </DialogHeader>
        <ShareContent
          {...rest}
          initialIsPublic={rest.isPublic}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ShareSermonDialog(props: ShareSermonDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSheet {...props} />;
  }

  return <DesktopDialog {...props} />;
}
