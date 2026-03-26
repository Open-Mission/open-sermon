"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { NewSermonDialog } from "./new-sermon-dialog";
import { cn } from "@/lib/utils";

export function NewSermonButtonInline({ className }: { className?: string }) {
  const t = useTranslations("dashboard");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className={cn("gap-1.5", className)}
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        <span className="hidden sm:inline">{t("newSermon")}</span>
      </Button>
      <NewSermonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
