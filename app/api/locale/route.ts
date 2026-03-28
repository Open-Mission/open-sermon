import { NextResponse } from "next/server";
import type { locales, Locale } from "@/i18n/request";

const validLocales: readonly Locale[] = ["pt", "en"];

export async function POST(request: Request) {
  const { locale } = await request.json();

  if (!locale || !validLocales.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}
