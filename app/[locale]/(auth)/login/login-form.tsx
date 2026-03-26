"use client";

import * as React from "react";
import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  signIn,
  signInWithMagicLink,
  type AuthResult,
} from "@/lib/supabase/actions";
import { Link } from "@/i18n/navigation";

const initialState: AuthResult = {};

export function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const originRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [passwordState, passwordAction, passwordPending] = useActionState(
    signIn,
    initialState
  );
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    initialState
  );

  const registered = searchParams.get("registered");

  React.useEffect(() => {
    setMounted(true);
    if (originRef.current) {
      originRef.current.value = window.location.origin;
    }
  }, []);

  React.useEffect(() => {
    if (magicState.error === undefined && !magicPending && mounted) {
      setMagicSent(true);
    }
  }, [magicState.error, magicPending, mounted]);

  return (
    <Card className="w-full border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-3xl font-heading font-bold tracking-tight bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("loginTitle")}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 mt-2 font-medium">
          {t("loginSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {registered && (
          <div className="mb-6 rounded-2xl bg-success/10 border border-success/20 p-4 text-sm text-success translate-y-0 animate-in fade-in slide-in-from-top-2 duration-300">
            {t("checkEmail")}
          </div>
        )}

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8">
            <TabsTrigger value="password" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
              {t("passwordTab")}
            </TabsTrigger>
            <TabsTrigger value="magic" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
              {t("magicLinkTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form action={passwordAction} className="space-y-5">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@church.com"
                  className="h-12 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 rounded-xl transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("password")}
                  </Label>
                  {/* Optional: Add forgot password link here */}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 rounded-xl transition-all"
                  required
                />
              </div>
              {passwordState.error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                  {passwordState.error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
                disabled={passwordPending}
              >
                {passwordPending ? <Spinner className="size-5" /> : t("login")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic">
            {magicSent ? (
              <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-2xl bg-muted/40 p-6 border border-border/40">
                  <p className="text-sm text-balance leading-relaxed text-muted-foreground font-medium">
                    {t("magicLinkSent")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold hover:bg-muted/60 transition-all"
                  onClick={() => setMagicSent(false)}
                >
                  {t("tryAgain")}
                </Button>
              </div>
            ) : (
              <form action={magicAction} className="space-y-5">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="origin" ref={originRef} />
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t("email")}
                  </Label>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="name@church.com"
                    className="h-12 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 rounded-xl transition-all"
                    required
                  />
                </div>
                {magicState.error && (
                  <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                    {magicState.error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
                  disabled={magicPending}
                >
                  {magicPending ? <Spinner className="size-5" /> : t("sendMagicLink")}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t border-border/20 text-center text-sm">
          <span className="text-muted-foreground font-medium">
            {t("noAccount")}{" "}
          </span>
          <Link
            href="/register"
            className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {t("register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
