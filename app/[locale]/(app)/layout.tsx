import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

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

  const t = await getTranslations("common");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">
              {t("logout")}
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
