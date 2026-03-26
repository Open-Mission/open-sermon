"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/mode-toggle";

export function Navbar() {
  const t = useTranslations("landing");
  const common = useTranslations("common");
  const auth = useTranslations("auth");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
          <div className="size-8 relative rounded-lg overflow-hidden border shadow-sm">
            <Image src="/logo.png" alt="Open Sermon" fill className="object-cover" />
          </div>
          <span>{common("appName")}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("viewFeatures")}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {auth("login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              {auth("register")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
