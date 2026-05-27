// ============================================================
// REMOVE MEMBER API - DELETE /api/projects/[projectId]/members/[userId]
// ============================================================
// Removes a specific member from a project.
// Only ADMIN users can remove members.
// Cannot remove the project owner.
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const { projectId, userId } = params;

    // Prevent removing the owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    if (project.ownerId === userId) {
      return errorResponse("Cannot remove the project owner", 400);
    }

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
