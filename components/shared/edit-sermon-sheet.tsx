"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateSermon, type SermonType } from "@/lib/sermon-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SERMON_TYPES: SermonType[] = [
  "preaching",
  "ebd_class",
  "devotional",
  "video_script",
  "cell",
];

interface EditSermonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermonId: string;
  initialData: {
    title: string;
    description: string;
    type: SermonType;
    preachedAt: string | null;
    tags: string[];
  };
}

export function EditSermonSheet({
  open,
  onOpenChange,
  sermonId,
  initialData,
}: EditSermonSheetProps) {
  const t = useTranslations();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [title, setTitle] = React.useState(initialData.title);
  const [description, setDescription] = React.useState(initialData.description);
  const [type, setType] = React.useState<SermonType>(initialData.type);
  const [preachedAt, setPreachedAt] = React.useState<Date | undefined>(
    initialData.preachedAt ? new Date(initialData.preachedAt) : undefined,
  );
  const [tagsInput, setTagsInput] = React.useState(initialData.tags.join(", "));
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setType(initialData.type);
      setPreachedAt(
        initialData.preachedAt ? new Date(initialData.preachedAt) : undefined,
      );
      setTagsInput(initialData.tags.join(", "));
    }
  }, [open, initialData]);

  const getTags = () => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    const result = await updateSermon(sermonId, {
      title,
      description,
      type,
      preachedAt: preachedAt ? preachedAt.toISOString() : null,
      tags: getTags(),
    });
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      onOpenChange(false);
      router.refresh();
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">{t("sermon.title")}</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">{t("sermon.description")}</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("sermon.type")}</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as SermonType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERMON_TYPES.map((sermonType) => (
              <SelectItem key={sermonType} value={sermonType}>
                {t(`sermon.types.${sermonType}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("sermon.preachedAt")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !preachedAt && "text-muted-foreground",
              )}
            >
              <HugeiconsIcon icon={CalendarIcon} size={16} className="mr-2" />
              {preachedAt
                ? format(preachedAt, "PPP")
                : t("sermon.preachedAtHint")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={preachedAt}
              onSelect={setPreachedAt}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-tags">{t("sermon.tags")}</Label>
        <Input
          id="edit-tags"
          placeholder={t("sermon.tagsHint")}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        {tagsInput && (
          <div className="flex flex-wrap gap-1 mt-2">
            {getTags().map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("sermon.editTitle")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{renderForm()}</div>
          <DrawerFooter>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? t("common.loading") : t("common.save")}
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle>{t("sermon.editTitle")}</SheetTitle>
        </SheetHeader>
        <div className="py-4 px-4">{renderForm()}</div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
