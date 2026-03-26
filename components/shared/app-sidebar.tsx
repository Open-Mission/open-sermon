import * as React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  Home01Icon,
  UserCircleIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { getSermons } from "@/lib/sermon-data";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SermonItem } from "./sermon-item";
import { NewSermonButton } from "./new-sermon-button";
import { UserMenu } from "./user-menu";

export async function AppSidebar() {
  const recentSermons = await getSermons(5);
  const allSermons = await getSermons();
  const t = await getTranslations("dashboard");
  const commonT = await getTranslations("common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:mx-auto hover:opacity-80 transition-opacity">
          <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center border shadow-sm relative">
            <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg leading-none tracking-tight group-data-[collapsible=icon]:hidden">
            {commonT("appName")}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <NewSermonButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("title")}>
                <Link href="/dashboard">
                  <HugeiconsIcon icon={Home01Icon} size={18} />
                  <span>{t("title")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{t("recentSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentSermons.map((sermon) => (
                <SermonItem key={`recent-${sermon.id}`} sermon={sermon} />
              ))}
              {recentSermons.length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground italic group-data-[collapsible=icon]:hidden">
                  {t("noSermons")}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{t("allSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="max-h-75 overflow-y-auto no-scrollbar">
              {allSermons.map((sermon) => (
                <SermonItem key={`all-${sermon.id}`} sermon={sermon} />
              ))}
              {allSermons.length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground italic group-data-[collapsible=icon]:hidden">
                  {t("noSermons")}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("series")}>
                <Link href="/series">
                  <HugeiconsIcon icon={Book01Icon} size={18} />
                  <span>{t("series")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("library")}>
                <Link href="/library">
                  <HugeiconsIcon icon={UserCircleIcon} size={18} />
                  <span>{t("library")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t mt-auto">
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
