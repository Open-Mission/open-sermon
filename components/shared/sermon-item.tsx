"use client";

import * as React from "react";
import { Sermon } from "@/types/sermon";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  MoreVerticalIcon,
  Edit02Icon,
  Delete01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { softDeleteSermon, renameSermon, toggleFavorite } from "@/lib/sermon-actions";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SermonItemProps {
  sermon: Sermon;
}

export function SermonItem({ sermon }: SermonItemProps) {
  const t = useTranslations();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(sermon.title);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(sermon.is_favorite ?? false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await softDeleteSermon(sermon.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsDeleteDialogOpen(false);
      setIsSheetOpen(false);
      router.refresh();
    }
  };

  const handleRename = async () => {
    if (!newTitle.trim()) return;

    setIsRenaming(true);
    const result = await renameSermon(sermon.id, newTitle);
    setIsRenaming(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsRenameDialogOpen(false);
      setIsSheetOpen(false);
      router.refresh();
    }
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    const result = await toggleFavorite(sermon.id);
    setIsTogglingFavorite(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsFavorite(result.isFavorite ?? false);
      setIsSheetOpen(false);
      router.refresh();
    }
  };

  const handleOpenMenu = () => {
    if (isMobile) {
      setIsSheetOpen(true);
    }
  };

  const menuContent = (
    <>
      <div
        onClick={handleToggleFavorite}
        className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={16}
          className={cn(isFavorite && "fill-yellow-500 text-yellow-500")}
        />
        <span>
          {isFavorite
            ? t("dashboard.removeFromFavorites")
            : t("dashboard.addToFavorites")}
        </span>
      </div>
      <div
        onClick={() => {
          setIsSheetOpen(false);
          setIsRenameDialogOpen(true);
        }}
        className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <HugeiconsIcon icon={Edit02Icon} size={16} />
        <span>{t("common.edit")}</span>
      </div>
      <div className="h-px bg-border mx-3" />
      <div
        onClick={() => {
          setIsSheetOpen(false);
          setIsDeleteDialogOpen(true);
        }}
        className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors text-destructive"
      >
        <HugeiconsIcon icon={Delete01Icon} size={16} />
        <span>{t("common.delete")}</span>
      </div>
    </>
  );

  return (
    <>
      <SidebarMenuItem>
        <div className="flex items-center gap-1 w-full">
          <SidebarMenuButton
            asChild
            tooltip={sermon.title}
            className="flex-1"
          >
            <a href={`/sermons/${sermon.id}`}>
              <HugeiconsIcon icon={File01Icon} size={18} />
              <span className="truncate">{sermon.title}</span>
            </a>
          </SidebarMenuButton>
          {isMobile ? (
            <button
              className="size-7 flex items-center justify-center rounded-none hover:bg-sidebar-accent shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMenu();
              }}
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="size-7 flex items-center justify-center rounded-none hover:bg-sidebar-accent shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="min-w-[220px]">
                <DropdownMenuItem
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={14}
                    className={cn(isFavorite && "fill-yellow-500 text-yellow-500")}
                  />
                  {isFavorite
                    ? t("dashboard.removeFromFavorites")
                    : t("dashboard.addToFavorites")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
          )}
        </div>
      </SidebarMenuItem>

      {/* Mobile Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl pb-8">
          <SheetHeader>
            <SheetTitle>{sermon.title}</SheetTitle>
          </SheetHeader>
          <div className="py-2">{menuContent}</div>
        </SheetContent>
      </Sheet>

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
