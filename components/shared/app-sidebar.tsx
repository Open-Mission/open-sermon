import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  Bookmark01Icon,
} from "@hugeicons/core-free-icons";
import { getSermons, getFavoriteSermons } from "@/lib/sermon-data";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { SermonItem } from "./sermon-item";
import { NewSermonButton } from "./new-sermon-button";
import { UserMenu } from "./user-menu";
import { CollapsibleSidebarGroup } from "./collapsible-sidebar-group";

export async function AppSidebar() {
  const recentSermons = await getSermons(5);
  const allSermons = await getSermons();
  const favoriteSermons = await getFavoriteSermons();
  const t = await getTranslations("dashboard");
  const commonT = await getTranslations("common");
  const profileT = await getTranslations("profile");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user?.id || "")
    .single();

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:mx-auto hover:opacity-80 transition-opacity">
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

        {/* <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("title")}>
                <Link href="/">
                  <HugeiconsIcon icon={Home01Icon} size={18} />
                  <span>{t("title")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/profile">
                  <HugeiconsIcon icon={UserCircleIcon} size={18} />
                  <span>{profileT("title")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}

        {favoriteSermons.length > 0 ? (
          <CollapsibleSidebarGroup label={t("favorites")}>
            <SidebarMenu>
              {favoriteSermons.map((sermon) => (
                <SermonItem key={`favorite-${sermon.id}`} sermon={sermon} />
              ))}
            </SidebarMenu>
          </CollapsibleSidebarGroup>
        ) : (
          <SidebarGroup>
            <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              {t("favorites")}
            </div>
            <div className="px-2 py-3 text-xs text-muted-foreground italic group-data-[collapsible=icon]:hidden">
              {t("noFavorites")}
            </div>
          </SidebarGroup>
        )}

        <CollapsibleSidebarGroup label={t("recentSermons")} defaultOpen={true}>
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
        </CollapsibleSidebarGroup>

        <CollapsibleSidebarGroup label={t("allSermons")} defaultOpen={false}>
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
        </CollapsibleSidebarGroup>

        {/* <SidebarGroup>
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
                  <HugeiconsIcon icon={Bookmark01Icon} size={18} />
                  <span>{t("library")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("title")}>
                <Link href="/">
                  <HugeiconsIcon icon={Home01Icon} size={18} />
                  <span>{t("title")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/profile">
                  <HugeiconsIcon icon={UserCircleIcon} size={18} />
                  <span>{profileT("title")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t mt-auto">
        <UserMenu user={user} avatarUrl={profile?.avatar_url} />
      </SidebarFooter>
    </Sidebar>
  );
}
