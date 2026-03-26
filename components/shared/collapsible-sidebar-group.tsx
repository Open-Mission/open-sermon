"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface CollapsibleSidebarGroupProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSidebarGroup({
  label,
  children,
  defaultOpen = true,
  className,
}: CollapsibleSidebarGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <SidebarGroup className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md px-2 h-8 text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:hidden"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      <SidebarGroupContent
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
