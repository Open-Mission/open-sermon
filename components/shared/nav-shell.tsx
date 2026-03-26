"use client";

import * as React from "react";
import { usePathname } from "@/i18n/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function NavShell({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname.startsWith("/sermons");

  if (!showSidebar) {
    return (
      <SidebarProvider>
        <main className="flex-1 overflow-auto w-full">{children}</main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
