import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ["/app", "/sermons", "/series", "/library"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameWithoutLocale = pathname.replace(/^\/(pt|en)/, "");

  let response = NextResponse.next({ request });

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

  if (
    !user &&
    !pathnameWithoutLocale.startsWith("/login") &&
    !pathnameWithoutLocale.startsWith("/auth/")
  ) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (pathnameWithoutLocale.startsWith("/auth/")) {
    return response;
  }

  const isProtected = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  if (isProtected && user) {
    return response;
  }

  return intlMiddleware(request);
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|offline|.*\\..*).*)"],
};

