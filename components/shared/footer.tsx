"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { Book01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("landing");
  const common = useTranslations("common");

  return (
    <footer className="py-24 border-t border-border/40 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
              <HugeiconsIcon icon={Book01Icon} className="size-6 text-primary" />
              <span>{common("appName")}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t("heroSubtitle")}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-heading font-semibold tracking-tight text-sm uppercase text-primary">Plataforma</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Funcionalidades</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Criar Conta</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-heading font-semibold tracking-tight text-sm uppercase text-primary">Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="https://github.com/Open-Mission/open-sermon" className="hover:text-foreground transition-colors" target="_blank">GitHub</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentação</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
          <p>{t("footerText")}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
