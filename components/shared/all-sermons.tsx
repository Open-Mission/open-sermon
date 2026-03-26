import { Sermon } from "@/types/sermon";
import { SidebarMenuItem } from "../ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";

export function AllSermons({ allSermons }: { allSermons: Sermon[] | [] }) {
  return (
    <>
      {allSermons.map((sermon) => (
        <SidebarMenuItem key={`all-${sermon.id}`}>
          <a
            href={`/sermons/${sermon.id}`}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-sidebar-accent rounded-none"
          >
            <HugeiconsIcon icon={File01Icon} size={18} />
            <span className="truncate">{sermon.title}</span>
          </a>
        </SidebarMenuItem>
      ))}
    </>
  );
}
