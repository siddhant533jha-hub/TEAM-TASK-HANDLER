// ============================================================
// TASK DETAIL API - GET / PATCH / DELETE
// ============================================================
// GET: Get single task details
// PATCH: Update task (ADMIN can update all, MEMBER can update own)
// DELETE: Delete task (ADMIN only)
//
// RBAC:
// - ADMIN: Full CRUD on all tasks
// - MEMBER: Can update status of tasks assigned to them
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, isAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { updateTaskSchema, updateTaskStatusSchema, taskIdSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await requireAuth();
    const { taskId } = taskIdSchema.parse(params);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // Check access
    if (!isAdmin(session.user.role)) {
      // Members can only see tasks from their projects or assigned to them
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: session.user.id },
        },
      });
      if (!isMember && task.assigneeId !== session.user.id) {
        return errorResponse("Access denied", 403);
      }
    }

    return successResponse(task);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[TASK GET ERROR]", error);
    return errorResponse("Failed to fetch task", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await requireAuth();
    const { taskId } = taskIdSchema.parse(params);

    // Fetch existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    const body = await req.json();

    // RBAC: Check permissions
    if (!isAdmin(session.user.role)) {
      // Members can only update status of tasks assigned to them
      if (existingTask.assigneeId !== session.user.id) {
        return errorResponse("You can only update tasks assigned to you", 403);
      }

      // Members can only update status
      const statusParsed = updateTaskStatusSchema.safeParse(body);
      if (!statusParsed.success) {
        return errorResponse("Members can only update task status", 403);
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: { status: statusParsed.data.status },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
      });

      return successResponse(task);
    }

    // ADMIN: Full update capability
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    // If reassigning, verify new assignee is project member
    if (parsed.data.assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: existingTask.projectId,
            userId: parsed.data.assigneeId,
          },
        },
      });
      if (!isMember) {
        return errorResponse("New assignee is not a project member", 400);
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return successResponse(task);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
    }
    console.error("[TASK PATCH ERROR]", error);
    return errorResponse("Failed to update task", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await requireAuth();

    // Only admins can delete tasks
    if (!isAdmin(session.user.role)) {
      return errorResponse("Admin access required to delete tasks", 403);
    }

    const { taskId } = taskIdSchema.parse(params);

    await prisma.task.delete({
      where: { id: taskId },
    });

    return successResponse({ message: "Task deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[TASK DELETE ERROR]", error);
    return errorResponse("Failed to delete task", 500);
  }
}
