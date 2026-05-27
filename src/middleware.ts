// ============================================================
// NEXT.JS MIDDLEWARE - ROUTE PROTECTION
// ============================================================
// This middleware runs on every request and:
// 1. Protects authenticated routes (redirects to /login if not auth)
// 2. Redirects authenticated users away from auth pages
// 3. Checks RBAC for admin-only routes
//
// Route Groups:
// - Public: /, /login, /signup
// - Protected: /dashboard, /projects, /tasks
// - Admin-only: /admin (if you add an admin panel)
// ============================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (token && (path === "/login" || path === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check admin routes (example: /admin/*)
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Public routes don't require auth
        if (req.nextUrl.pathname === "/login") return true;
        if (req.nextUrl.pathname === "/signup") return true;
        if (req.nextUrl.pathname === "/") return true;
        if (req.nextUrl.pathname.startsWith("/api/auth")) return true;

        // All other routes require authentication
        return token !== null;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/login",
    "/signup",
  ],
};
