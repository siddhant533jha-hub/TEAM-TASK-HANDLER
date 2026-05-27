// ============================================================
// PROJECT DETAIL API - GET / PATCH / DELETE
// ============================================================
// GET: Get single project details
// PATCH: Update project (ADMIN only)
// DELETE: Delete project (ADMIN only)
//
// RBAC enforced at route level.
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { updateProjectSchema, projectIdSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireAuth();
    const { projectId } = projectIdSchema.parse(params);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // Check access: admin can see all, members only their projects
    const isMember = project.members.some((m) => m.userId === session.user.id);
    if (session.user.role !== "ADMIN" && !isMember) {
      return errorResponse("Access denied", 403);
    }

    return successResponse(project);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[PROJECT GET ERROR]", error);
    return errorResponse("Failed to fetch project", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const { projectId } = projectIdSchema.parse(params);
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: parsed.data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    return successResponse(project);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[PROJECT PATCH ERROR]", error);
    return errorResponse("Failed to update project", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const { projectId } = projectIdSchema.parse(params);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return successResponse({ message: "Project deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[PROJECT DELETE ERROR]", error);
    return errorResponse("Failed to delete project", 500);
  }
}
