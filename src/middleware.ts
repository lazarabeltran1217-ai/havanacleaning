import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes require OWNER role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "OWNER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Employee portal requires EMPLOYEE role
    if (pathname.startsWith("/portal")) {
      if (token?.role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Account routes require any authenticated user
    if (pathname.startsWith("/account")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Only require auth for protected routes
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/portal") ||
          pathname.startsWith("/account")
        ) {
          return !!token;
        }
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/account/:path*"],
};
