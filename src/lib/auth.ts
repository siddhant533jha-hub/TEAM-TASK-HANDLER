// ============================================================
// NEXTAUTH CONFIGURATION - AUTHENTICATION & RBAC FOUNDATION
// ============================================================
// This file configures NextAuth.js with:
// 1. Credentials Provider (email/password)
// 2. JWT Session Strategy (stateless, edge-compatible)
// 3. Role-based session enrichment
// 4. Custom callbacks for authorization
//
// RBAC LOGIC:
// - User.role is stored in the JWT token during sign-in
// - The role is passed through to the session callback
// - API routes check session.user.role for authorization
// - Middleware checks token.role for route protection
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Zod schema for credential validation
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthOptions = {
  // ============================================================
  // PROVIDERS
  // ============================================================
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "neo@matrix.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input with Zod
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials format");
        }

        const { email, password } = parsed.data;

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object (will be encoded into JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // ============================================================
  // SESSION CONFIGURATION
  // ============================================================
  // Using JWT strategy for stateless sessions.
  // Benefits: No database lookup per request, works at Edge,
  // scales horizontally without sticky sessions.
  // Trade-off: Cannot revoke sessions instantly (token has TTL).
  // ============================================================
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,    // Refresh token every 24 hours
  },

  // ============================================================
  // JWT CONFIGURATION
  // ============================================================
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  // ============================================================
  // PAGES
  // ============================================================
  // Custom pages override NextAuth defaults
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ============================================================
  // CALLBACKS - THE RBAC PIPELINE
  // ============================================================
  callbacks: {
    // JWT Callback: Called when JWT is created or updated
    // We inject the user's role and ID into the token
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: copy user data to token
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Session Callback: Called whenever session is checked
    // We expose role and ID from token to session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  // ============================================================
  // EVENTS
  // ============================================================
  events: {
    async signIn({ user }) {
      console.log(`[AUTH] User signed in: ${user.email} (${user.role})`);
    },
  },

  // ============================================================
  // SECURITY
  // ============================================================
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
