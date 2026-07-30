import { NextRequest, NextResponse } from "next/server";

// Lightweight presence check only (edge runtime can't run jsonwebtoken).
// Full session verification + role checks happen server-side via getSession()
// in the actual page/layout/route handler.
const COOKIE_NAME = "session";

const PROTECTED_PREFIXES = ["/account", "/orders", "/stitching/my-orders"];
const STAFF_AREAS: { prefix: string; publicPaths: string[]; loginPath: string }[] = [
  { prefix: "/admin", publicPaths: ["/admin/login"], loginPath: "/admin/login" },
  { prefix: "/tailor", publicPaths: ["/tailor/login", "/tailor/signup"], loginPath: "/tailor/login" },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(COOKIE_NAME)?.value);

  for (const area of STAFF_AREAS) {
    if (pathname.startsWith(area.prefix) && !area.publicPaths.includes(pathname)) {
      if (!hasSession) {
        return NextResponse.redirect(new URL(area.loginPath, req.url));
      }
      return NextResponse.next();
    }
  }

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/stitching/my-orders",
    "/admin/:path*",
    "/tailor/:path*",
  ],
};
