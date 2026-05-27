// ============================================================
// NEXT-AUTH TYPE EXTENSIONS
// ============================================================
// We extend the default NextAuth types to include our custom
// fields: role (for RBAC) and id (for database lookups).
//
// These extensions allow TypeScript to recognize our custom
// session properties throughout the application.
// ============================================================

import { UserRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
  }
}
