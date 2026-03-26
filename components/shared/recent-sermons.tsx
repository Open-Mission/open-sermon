"use client";

import { Sermon } from "@/types/sermon";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon } from "@hugeicons/core-free-icons";

export function RecentSermons({
  recentSermons,
}: {
  recentSermons: Sermon[] | [];
}) {
  return (
    <>
      {recentSermons.map((sermon) => (
        <SidebarMenuItem key={`recent-${sermon.id}`}>
          <SidebarMenuButton asChild tooltip={sermon.title}>
            <Link href={`/sermons/${sermon.id}`}>
              <HugeiconsIcon icon={Note01Icon} size={18} />
              <span>{sermon.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
