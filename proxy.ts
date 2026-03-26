import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ["/app", "/sermons", "/series", "/library"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run intl middleware first to handle locale redirects/rewrites
  const intlResponse = intlMiddleware(request);

  // Check if the path already has a locale prefix
  const hasLocalePrefix = /^\/(pt|en)(\/|$)/.test(pathname);
  const pathnameWithoutLocale = hasLocalePrefix
    ? pathname.replace(/^\/(pt|en)/, "") || "/"
    : pathname;

  // Handle auth callback routes (no auth check needed)
  if (pathnameWithoutLocale.startsWith("/auth/")) {
    return hasLocalePrefix ? intlResponse : intlMiddleware(request);
  }

  // Check if it's a protected route
  const isProtected = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Only check auth for protected routes
  if (isProtected) {
    let response = intlResponse;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    return response;
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|offline|.*\\..*).*)"],
};

