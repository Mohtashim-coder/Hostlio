/**
 * Next.js Middleware
 * Handles route-level authentication and role-based access.
 */

import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production");

const routeAccess: Record<string, string[]> = {
  "/dashboard": ["admin"],
  "/owner": ["owner", "admin"],
  "/manager": ["manager", "admin"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname === "/owner/new") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Prefix-match protected routes
  const matchedRoute = Object.keys(routeAccess).find((route) =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;

      if (!routeAccess[matchedRoute].includes(userRole)) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Prevent logged-in users from visiting /login
  if (pathname === "/login" && token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/profile", req.url));
    } catch {
      // Invalid token — let them see the login page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
