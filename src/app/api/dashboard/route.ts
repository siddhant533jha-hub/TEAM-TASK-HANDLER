// ============================================================
// DASHBOARD API
// ============================================================
// Aggregates data for the futuristic dashboard:
// - Task distribution by status (for charts)
// - Priority breakdown
// - Overdue tasks count
// - Recent activity
// - Project statistics
//
// RBAC: Admins see all data, Members see their project data
// ============================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const userRole = session.user.role;

    let projectFilter: any = {};
    let taskFilter: any = {};

    // Apply RBAC filters
    if (userRole === "MEMBER") {
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((m) => m.projectId);
      projectFilter = { id: { in: projectIds } };
      taskFilter = { projectId: { in: projectIds } };
    }

    // Get project statistics
    const totalProjects = await prisma.project.count({ where: projectFilter });
    const activeProjects = await prisma.project.count({
      where: { ...projectFilter, status: "active" },
    });

    // Get task statistics
    const totalTasks = await prisma.task.count({ where: taskFilter });
    const todoTasks = await prisma.task.count({
      where: { ...taskFilter, status: "TODO" },
    });
    const inProgressTasks = await prisma.task.count({
      where: { ...taskFilter, status: "IN_PROGRESS" },
    });
    const doneTasks = await prisma.task.count({
      where: { ...taskFilter, status: "DONE" },
    });

    // Priority breakdown
    const priorityStats = await prisma.task.groupBy({
      by: ["priority"],
      where: taskFilter,
      _count: { priority: true },
    });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskFilter,
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    });

    // Recent tasks (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = await prisma.task.count({
      where: {
        ...taskFilter,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Tasks per project for chart
    const tasksPerProject = await prisma.project.findMany({
      where: projectFilter,
      select: {
        name: true,
        _count: { select: { tasks: true } },
      },
    });

    // Recent activity (last 10 tasks updated)
    const recentActivity = await prisma.task.findMany({
      where: taskFilter,
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    });

    // Monthly task creation trend (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const monthlyTrend = await prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        ...taskFilter,
        createdAt: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    });

    return successResponse({
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        recentTasks,
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      },
      statusDistribution: [
        { name: "To Do", value: todoTasks, color: "#fbbf24" },
        { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
        { name: "Done", value: doneTasks, color: "#22c55e" },
      ],
      priorityBreakdown: priorityStats.map((p) => ({
        name: p.priority,
        value: p._count.priority,
      })),
      tasksPerProject: tasksPerProject.map((p) => ({
        name: p.name,
        tasks: p._count.tasks,
      })),
      recentActivity,
      monthlyTrend,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error("[DASHBOARD ERROR]", error);
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
