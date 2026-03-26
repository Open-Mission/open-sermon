"use client";

import * as React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircleIcon,
  Logout01Icon,
  Settings02Icon,
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: any;
  showDetails?: boolean;
}

export function UserMenu({ user, showDetails = true }: UserMenuProps) {
  const t = useTranslations("common");
  const { setTheme, theme } = useTheme();
  
  const userProfile = user?.user_metadata || {};
  const initials = user?.email?.substring(0, 2).toUpperCase() || "US";
  const displayName = userProfile.full_name || user?.email?.split("@")[0] || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto p-1 items-center justify-start gap-3 hover:bg-accent/50 rounded-xl transition-all border border-transparent hover:border-border/50",
            !showDetails && "h-10 w-10 p-0 justify-center rounded-full"
          )}
        >
          <Avatar size={showDetails ? "default" : "lg"}>
            <AvatarFallback className="text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {showDetails && (
            <div className="flex flex-col text-left overflow-hidden flex-1">
              <span className="text-xs font-semibold truncate leading-none mb-1">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate leading-none">
                {user?.email}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={showDetails ? "start" : "end"}
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
        
        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild>
            <Link 
              href="/profile" 
              className="flex items-center gap-2 rounded-lg cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground"
            >
              <HugeiconsIcon icon={Settings02Icon} size={18} />
              <span className="flex-1">Profile & Settings</span>
            </Link>
          </DropdownMenuItem>

          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={theme === "dark" ? Moon02Icon : Sun01Icon} size={18} />
              <span className="text-sm">Appearance</span>
            </div>
            <div className="flex bg-muted p-1 rounded-md">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1 rounded transition-all",
                  theme === "light" ? "bg-background shadow-sm" : "hover:text-primary"
                )}
              >
                <HugeiconsIcon icon={Sun01Icon} size={14} />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1 rounded transition-all",
                  theme === "dark" ? "bg-background shadow-sm" : "hover:text-primary"
                )}
              >
                <HugeiconsIcon icon={Moon02Icon} size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserCircleIcon} size={18} />
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
              className="flex w-full items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left font-medium"
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} />
              <span>{t("logout")}</span>
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
