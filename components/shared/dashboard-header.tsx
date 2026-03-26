"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings02Icon, Logout01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/supabase/actions";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface DashboardHeaderProps {
  user: {
    email?: string | null;
    user_metadata?: Record<string, string>;
  } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("common");

  const initials = user?.email?.substring(0, 2).toUpperCase() || "US";
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border/50">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center border shadow-sm relative">
          <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
        </div>
        <span className="font-bold text-base leading-none tracking-tight hidden sm:block">
          Open Sermon
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
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

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto py-1 px-2.5 flex items-center gap-2 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all"
            >
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-xs">
                {initials}
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-2 rounded-2xl shadow-xl border-muted bg-popover"
          >
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-1 space-y-0.5">
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground"
                >
                  <HugeiconsIcon icon={Settings02Icon} size={17} />
                  <span className="flex-1 text-sm">Profile & Settings</span>
                </Link>
              </DropdownMenuItem>

              <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon icon={Globe02Icon} size={17} />
                  <span className="text-sm">Language</span>
                </div>
                <LocaleSwitcher />
              </div>
            </div>

            <DropdownMenuSeparator />

            <div className="p-1">
              <form action={signOut} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left font-medium"
                >
                  <HugeiconsIcon icon={Logout01Icon} size={17} />
                  <span>{t("logout")}</span>
                </button>
              </form>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
