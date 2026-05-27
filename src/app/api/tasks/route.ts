// ============================================================
// TASKS API - GET / POST
// ============================================================
// GET: List tasks (filtered by project if projectId provided)
// POST: Create a new task (ADMIN only)
//
// RBAC:
// - ADMIN: Can create tasks, assign to anyone, see all tasks
// - MEMBER: Can view tasks in their projects, update own tasks
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { createTaskSchema } from "@/lib/validations";

// GET /api/tasks - List tasks
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const userRole = session.user.role;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");

    let where: any = {};

    // Filter by project if provided
    if (projectId) {
      where.projectId = projectId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by assignee if provided
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // For MEMBER role: only show tasks from projects they belong to
    // or tasks assigned to them
    if (userRole === "MEMBER") {
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((m) => m.projectId);

      where = {
        ...where,
        OR: [
          { projectId: { in: projectIds } },
          { assigneeId: userId },
        ],
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return successResponse(tasks);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[TASKS GET ERROR]", error);
    return errorResponse("Failed to fetch tasks", 500);
  }
}

// POST /api/tasks - Create task (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { title, description, priority, dueDate, assigneeId } = parsed.data;
    const { projectId } = body;

    if (!projectId) {
      return errorResponse("Project ID is required", 400);
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // If assignee provided, verify they are a project member
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: assigneeId },
        },
      });
      if (!isMember) {
        return errorResponse("Assignee is not a member of this project", 400);
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: session.user.id,
        assigneeId: assigneeId || null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(task, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[TASKS POST ERROR]", error);
    return errorResponse("Failed to create task", 500);
  }
}
