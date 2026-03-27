"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreHorizontalIcon,
  Edit02Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { softDeleteSermon, renameSermon } from "@/lib/sermon-actions";

interface SermonActionsDropdownProps {
  sermonId: string;
  sermonTitle: string;
}

export function SermonActionsDropdown({
  sermonId,
  sermonTitle,
}: SermonActionsDropdownProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(sermonTitle);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleRename = async () => {
    if (!newTitle.trim()) return;

    setIsRenaming(true);
    const result = await renameSermon(sermonId, newTitle);
    setIsRenaming(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsRenameDialogOpen(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await softDeleteSermon(sermonId);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsDeleteDialogOpen(false);
      router.push("/");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
            <HugeiconsIcon icon={Edit02Icon} size={14} />
            {t("common.edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
            {t("common.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sermon.renameTitle")}</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            className="select-none"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sermon.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("sermon.deleteConfirmation")}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
