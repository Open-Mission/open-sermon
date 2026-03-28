"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UserMenu } from "./user-menu";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface DashboardHeaderProps {
  user: {
    id?: string;
    email?: string | null;
    user_metadata?: Record<string, string>;
  } | null;
  avatarUrl?: string | null;
}

export function DashboardHeader({ user, avatarUrl }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border/50">
      <Link
        href="/"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center border shadow-sm relative">
          <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
        </div>
        <span className="font-bold text-base leading-none tracking-tight hidden sm:block">
          Open Sermon
        </span>
      </Link>

      <div className="flex items-center gap-1.5">
        <div className="flex bg-muted p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              theme === "light"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Light mode"
          >
            <HugeiconsIcon icon={Sun01Icon} size={15} />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              theme === "dark"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Dark mode"
          >
            <HugeiconsIcon icon={Moon02Icon} size={15} />
          </button>
        </div>

        <UserMenu user={user} avatarUrl={avatarUrl} showDetails />
      </div>
    </header>
  );
}
