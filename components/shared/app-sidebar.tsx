import * as React from "react";
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
  Add01Icon,
  Book01Icon,
  Home01Icon,
  UserCircleIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { getSermons } from "@/lib/sermon-data";
import { createSermon } from "@/lib/sermon-actions";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecentSermons } from "./recent-sermons";
import { AllSermons } from "./all-sermons";

export async function AppSidebar() {
  const recentSermons = await getSermons(5);
  const allSermons = await getSermons();
  console.log("Fetched all sermons:", allSermons);
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={createSermon}>
              <SidebarMenuButton
                className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent"
                tooltip={t("newSermon")}
                type="submit"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} />
                <span>{t("newSermon")}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
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

        {/* Seção Recentes (5 últimos) */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("recentSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <RecentSermons recentSermons={recentSermons} />
              {recentSermons.length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground italic">
                  {t("noSermons")}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Todos os Sermões */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("allSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="max-h-75 overflow-y-auto no-scrollbar">
              <AllSermons allSermons={allSermons} />
              {allSermons.length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground italic">
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <HugeiconsIcon icon={UserCircleIcon} size={16} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium truncate">
                  {user?.email?.split("@")[0] || "Usuário"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
