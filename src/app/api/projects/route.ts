// ============================================================
// PROJECTS API - GET / POST
// ============================================================
// GET: List all projects the user has access to
// POST: Create a new project (ADMIN only)
//
// RBAC:
// - ADMIN: Can create projects, sees all projects
// - MEMBER: Can only see projects they are members of
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, successResponse, errorResponse } from "@/lib/api-utils";
import { createProjectSchema } from "@/lib/validations";

// GET /api/projects - List projects
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const userRole = session.user.role;

    let projects;

    if (userRole === "ADMIN") {
      // Admins see all projects with full details
      projects = await prisma.project.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true, members: true } },
          tasks: {
            select: { status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Members see only projects they belong to
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true, members: true } },
          tasks: {
            select: { status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Add task summary to each project
    const projectsWithSummary = projects.map((project) => {
      const taskCounts = {
        todo: project.tasks.filter((t) => t.status === "TODO").length,
        inProgress: project.tasks.filter((t) => t.status === "IN_PROGRESS").length,
        done: project.tasks.filter((t) => t.status === "DONE").length,
        total: project.tasks.length,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tasks, ...projectData } = project;
      return { ...projectData, taskSummary: taskCounts };
    });

    return successResponse(projectsWithSummary);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[PROJECTS GET ERROR]", error);
    return errorResponse("Failed to fetch projects", 500);
  }
}

// POST /api/projects - Create project (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireAdmin(session.user.role);

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten());
    }

    const { name, description } = parsed.data;

    // Create project and add owner as member
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return errorResponse("Authentication required", 401);
      if (error.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    }
    console.error("[PROJECTS POST ERROR]", error);
    return errorResponse("Failed to create project", 500);
  }
}
