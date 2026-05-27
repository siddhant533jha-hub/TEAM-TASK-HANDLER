// ============================================================
// API UTILITY FUNCTIONS
// ============================================================
// Helper functions for API route handlers including:
// - Authentication checks
// - RBAC authorization
// - Error response formatting
// - Success response formatting
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// --------------------------------------------------
// AUTHENTICATION HELPERS
// --------------------------------------------------

/**
 * Get the current authenticated session from a request.
 * Returns null if not authenticated.
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication. Returns session or throws 401 response.
 * Use this at the start of protected API routes.
 */
export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// --------------------------------------------------
// RBAC AUTHORIZATION HELPERS
// --------------------------------------------------

/**
 * Check if user has ADMIN role.
 * Admins can: create/delete projects, assign tasks, manage members
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Check if user has MEMBER role.
 * Members can: view projects, update own task status
 */
export function isMember(role: UserRole): boolean {
  return role === "MEMBER";
}

/**
 * Require ADMIN role. Throws 403 if user is not admin.
 */
export function requireAdmin(role: UserRole): void {
  if (!isAdmin(role)) {
    throw new Error("FORBIDDEN");
  }
}

// --------------------------------------------------
// RESPONSE HELPERS
// --------------------------------------------------

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

// --------------------------------------------------
// ERROR HANDLER WRAPPER
// --------------------------------------------------

/**
 * Wraps API route handlers with standardized error handling.
 * Catches auth errors (401, 403) and returns proper responses.
 */
export function withErrorHandler(handler: () => Promise<NextResponse>) {
  return async (): Promise<NextResponse> => {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          return errorResponse("Authentication required", 401);
        }
        if (error.message === "FORBIDDEN") {
          return errorResponse("You don't have permission to perform this action", 403);
        }
        return errorResponse(error.message, 400);
      }
      return errorResponse("Internal server error", 500);
    }
  };
}
