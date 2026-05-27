// ============================================================
// ZOD VALIDATION SCHEMAS
// ============================================================
// Strict validation for all API endpoints and forms.
// These schemas enforce data integrity and prevent injection attacks.
// ============================================================

import { z } from "zod";
import { TaskStatus, TaskPriority, UserRole } from "@prisma/client";

// --------------------------------------------------
// AUTH SCHEMAS
// --------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// --------------------------------------------------
// PROJECT SCHEMAS
// --------------------------------------------------

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// --------------------------------------------------
// TASK SCHEMAS
// --------------------------------------------------

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().uuid("Invalid assignee ID").optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// --------------------------------------------------
// PARAM SCHEMAS (for route parameters)
// --------------------------------------------------

export const projectIdSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

export const taskIdSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
});
