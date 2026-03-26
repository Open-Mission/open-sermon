"use client";

import * as React from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { NewSermonDialog } from "./new-sermon-dialog";

export function NewSermonButton() {
  const t = useTranslations("dashboard");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <SidebarMenuButton
        className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent"
        tooltip={t("newSermon")}
        onClick={() => setIsDialogOpen(true)}
      >
        <HugeiconsIcon icon={Add01Icon} size={18} />
        <span>{t("newSermon")}</span>
      </SidebarMenuButton>
      <NewSermonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
