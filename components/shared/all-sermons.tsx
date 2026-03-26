import { Sermon } from "@/types/sermon";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export function AllSermons({ allSermons }: { allSermons: Sermon[] | [] }) {
  return (
    <>
      {allSermons.map((sermon) => (
        <SidebarMenuItem key={`all-${sermon.id}`}>
          <SidebarMenuButton asChild tooltip={sermon.title}>
            <Link href={`/sermons/${sermon.id}`}>
              <HugeiconsIcon icon={File01Icon} size={18} />
              <span>{sermon.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
