"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

interface SermonPageHeaderProps {
  children: React.ReactNode;
}

export function SermonPageHeader({ children }: SermonPageHeaderProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b border-transparent hover:border-border transition-colors group">
      <div className="flex items-center gap-2">
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => router.push("/")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        ) : (
          <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
        )}
        <nav className="flex items-center text-sm font-medium text-muted-foreground overflow-hidden" />
      </div>

      {children}
    </header>
  );
}
