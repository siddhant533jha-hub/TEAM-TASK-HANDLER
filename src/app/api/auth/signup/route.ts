// ============================================================
// SIGNUP API ROUTE
// ============================================================
// Handles user registration with:
// 1. Zod validation of input data
// 2. Email uniqueness check
// 3. bcrypt password hashing (salt rounds: 12)
// 4. User creation in database
//
// NOTE: Only ADMIN users can create other ADMIN accounts.
// Default role for self-registration is MEMBER.
// ============================================================

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { name, email, password, role } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "MEMBER", // Default to MEMBER for security
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(
      { user, message: "Account created successfully" },
      201
    );
  } catch (error) {
    console.error("[SIGNUP ERROR]", error);
    return errorResponse("Failed to create account", 500);
  }
}
