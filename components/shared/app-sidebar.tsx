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
  GlobeIcon,
  Logout01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { getSermons } from "@/lib/sermon-data";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SermonItem } from "./sermon-item";
import { NewSermonButton } from "./new-sermon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOut } from "@/lib/supabase/actions";

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
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:mx-auto hover:opacity-80 transition-opacity">
          <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center border shadow-sm relative">
            <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg leading-none tracking-tight group-data-[collapsible=icon]:hidden">
            {commonT("appName")}
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:mx-auto">
          <ModeToggle />
        </div>
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
          <SidebarGroupLabel>{t("recentSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentSermons.map((sermon) => (
                <SermonItem key={`recent-${sermon.id}`} sermon={sermon} />
              ))}
              {recentSermons.length === 0 && (
                <div className="px-2 py-4 text-xs text-muted-foreground italic">
                  {t("noSermons")}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("allSermons")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="max-h-75 overflow-y-auto no-scrollbar">
              {allSermons.map((sermon) => (
                <SermonItem key={`all-${sermon.id}`} sermon={sermon} />
              ))}
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

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 w-full justify-start gap-2 px-2 hover:bg-sidebar-accent transition-colors">
                  <div className="size-8 min-w-8 rounded-full bg-sidebar-accent flex items-center justify-center border shadow-sm text-sidebar-accent-foreground">
                    <HugeiconsIcon icon={UserCircleIcon} size={16} />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="text-xs font-semibold truncate leading-none">
                      {user?.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-1">
                      {user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 overflow-hidden rounded-xl shadow-lg border-muted bg-popover"
              >
                <div className="px-3 py-2 border-b bg-muted/30">
                  <p className="text-xs font-medium truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <HugeiconsIcon icon={Settings02Icon} size={16} />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                    <HugeiconsIcon icon={GlobeIcon} size={16} />
                    <span className="flex-1">Language</span>
                    <LocaleSwitcher />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <form action={signOut} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
                    >
                      <HugeiconsIcon icon={Logout01Icon} size={16} />
                      <span>{commonT("logout")}</span>
                    </button>
                  </form>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
