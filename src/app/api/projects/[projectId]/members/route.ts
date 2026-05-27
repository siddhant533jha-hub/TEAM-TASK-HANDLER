// ============================================================
// PROJECT MEMBERS API
// ============================================================
// POST: Add a member to a project (ADMIN only)
// DELETE: Remove a member from a project (ADMIN only)
//
// Only admins can manage project membership.
// Members must be existing users in the system.
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { addMemberSchema, projectIdSchema } from "@/lib/validations";

// POST /api/projects/[projectId]/members - Add member
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const { projectId } = projectIdSchema.parse(params);
    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { userId } = parsed.data;

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (existing) {
      return errorResponse("User is already a member of this project", 409);
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return successResponse(member, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[MEMBER POST ERROR]", error);
    return errorResponse("Failed to add member", 500);
  }
}

// DELETE /api/projects/[projectId]/members/[userId] - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const { projectId } = projectIdSchema.parse({ projectId: params.projectId });
    const userId = params.userId;

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    return successResponse({ message: "Member removed successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[MEMBER DELETE ERROR]", error);
    return errorResponse("Failed to remove member", 500);
  }
}
