"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSermonWithTitle } from "@/lib/sermon-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

interface NewSermonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSermonDialog({ open, onOpenChange }: NewSermonDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [title, setTitle] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    const result = await createSermonWithTitle(title);
    setIsCreating(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.sermonId) {
      setTitle("");
      onOpenChange(false);
      router.push(`/sermons/${result.sermonId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("dashboard.newSermon")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <Input
              placeholder={t("sermon.title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <DrawerFooter>
            <Button onClick={handleCreate} disabled={isCreating}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              {isCreating ? t("common.loading") : t("common.create")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.newSermon")}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={t("sermon.title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            {isCreating ? t("common.loading") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
