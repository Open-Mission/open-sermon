"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
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
import { signUp, signInWithGoogle, type AuthResult } from "@/lib/supabase/actions";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";

const initialState: AuthResult = {};

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [state, action, pending] = useActionState(signUp, initialState);
  const [success, setSuccess] = React.useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const handleGoogleSignIn = async () => {
    setGooglePending(true);
    await signInWithGoogle(locale);
  };

  React.useEffect(() => {
    if (state.error === undefined && !pending) {
      setSuccess(true);
    }
  }, [state, pending]);

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
            onClick={() => router.push("/login?registered=true")}
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
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold rounded-xl border-border/40 bg-background/50 hover:bg-muted/60 transition-all"
          onClick={handleGoogleSignIn}
          disabled={googlePending}
        >
          {googlePending ? (
            <Spinner className="size-5" />
          ) : (
            <>
              <svg className="size-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("continueWithGoogle")}
            </>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

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
