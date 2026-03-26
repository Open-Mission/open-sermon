import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { NavShell } from "@/components/shared/nav-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <TooltipProvider delayDuration={0}>
      <NavShell sidebar={<AppSidebar />}>
        {children}
      </NavShell>
    </TooltipProvider>
  );
}
