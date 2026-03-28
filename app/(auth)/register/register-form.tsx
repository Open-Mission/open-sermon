"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { signUp, type AuthResult } from "@/lib/supabase/actions";
import { Link } from "@/i18n/navigation";

const initialState: AuthResult = {};

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [state, action, pending] = useActionState(signUp, initialState);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const success = hasSubmitted && !pending && state.error === undefined;

  React.useEffect(() => {
    if (pending) {
      setHasSubmitted(true);
    }
  }, [pending]);

  if (success) {
    return (
      <Card className="w-full border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pt-10 pb-6 px-8">
          <CardTitle className="text-3xl font-heading font-bold tracking-tight bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent italic">
            {t("registerSuccess")}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium mt-4 leading-relaxed">
            {t("registerSuccessSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <Button
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            onClick={() => router.push(`/${locale}/login?registered=true`)}
          >
            {t("goToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative group animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-3xl font-heading font-bold tracking-tight bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("registerTitle")}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 mt-2 font-medium">
          {t("registerSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form action={action} className="space-y-5">
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
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              {t("password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/20 rounded-xl transition-all"
              required
              minLength={6}
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg animate-in fade-in zoom-in-95 duration-200">
              {state.error}
            </p>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2" 
            disabled={pending}
          >
            {pending ? <Spinner className="size-5" /> : t("register")}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/20 text-center text-sm">
          <span className="text-muted-foreground font-medium">
            {t("hasAccount")}{" "}
          </span>
          <Link
            href="/login"
            className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {t("login")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
