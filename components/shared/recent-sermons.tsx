"use client";

import { Sermon } from "@/types/sermon";
import { SidebarMenuItem } from "../ui/sidebar";
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
          <a
            href={`/sermons/${sermon.id}`}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-sidebar-accent rounded-none"
          >
            <HugeiconsIcon icon={Note01Icon} size={18} />
            <span className="truncate">{sermon.title}</span>
          </a>
        </SidebarMenuItem>
      ))}
    </>
  );
}
