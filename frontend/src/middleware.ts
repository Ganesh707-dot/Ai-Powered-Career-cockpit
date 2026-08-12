import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  isSiteLockEnabled,
  isValidSiteAccessCookie,
} from "@/lib/site-access";

function exempt(pathname: string): boolean {
  return (
    pathname === "/site-access" ||
    pathname.startsWith("/api/site-access") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isSiteLockEnabled() || exempt(pathname)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!isValidSiteAccessCookie(cookie)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { detail: "Site locked — unlock at /site-access first" },
        { status: 401 }
      );
    }
    const gate = new URL("/site-access", req.url);
    gate.searchParams.set("from", pathname);
    return NextResponse.redirect(gate);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
