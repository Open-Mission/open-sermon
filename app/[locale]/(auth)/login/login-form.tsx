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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
        <CardDescription>{t("loginSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            {t("checkEmail")}
          </div>
        )}

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">{t("passwordTab")}</TabsTrigger>
            <TabsTrigger value="magic">{t("magicLinkTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form action={passwordAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              {passwordState.error && (
                <p className="text-sm text-destructive">
                  {passwordState.error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={passwordPending}
              >
                {passwordPending && <Spinner className="mr-2 size-4" />}
                {t("login")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic">
            {magicSent ? (
              <div className="space-y-4 text-center">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("magicLinkSent")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMagicSent(false)}
                >
                  {t("tryAgain")}
                </Button>
              </div>
            ) : (
              <form action={magicAction} className="space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="origin" ref={originRef} />
                <div className="space-y-2">
                  <Label htmlFor="magic-email">{t("email")}</Label>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {magicState.error && (
                  <p className="text-sm text-destructive">
                    {magicState.error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={magicPending}
                >
                  {magicPending && <Spinner className="mr-2 size-4" />}
                  {t("sendMagicLink")}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {t("noAccount")}{" "}
          </span>
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {t("register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
