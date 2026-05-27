// ============================================================
// NEXTAUTH API ROUTE
// ============================================================
// This route handles all authentication endpoints:
// - POST /api/auth/signin (login)
// - POST /api/auth/signout (logout)
// - GET /api/auth/session (get session)
// - GET /api/auth/providers (list providers)
//
// NextAuth.js automatically creates these endpoints.
// ============================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
