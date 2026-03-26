"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { NewSermonDialog } from "./new-sermon-dialog";
import { cn } from "@/lib/utils";

export function NewSermonFab() {
  const t = useTranslations("dashboard");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsDialogOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-transform hover:scale-105 active:scale-95"
        )}
      >
        <HugeiconsIcon icon={Add01Icon} size={24} />
        <span className="sr-only">{t("newSermon")}</span>
      </Button>
      <NewSermonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
