"use client";

// ============================================================
// PROJECT DETAIL PAGE
// ============================================================
// Shows detailed view of a single project with:
// - Project info and member list
// - Task list with filtering
// - Create task modal (ADMIN only)
// - Task status updates
// - Member management (ADMIN only)
//
// RBAC:
// - ADMIN: Full CRUD on tasks, manage members
// - MEMBER: View tasks, update own task status
// ============================================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  X,
  UserPlus,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { ParticleBackground } from "@/components/3d/particle-background";
import { formatDate, isOverdue } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string | null;
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string };
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
const projectId = params.projectId;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "ADMIN";

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: "",
  });

  // Fetch project details
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
  });

  const project = projectData?.data;

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setCreateTaskOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove member");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const filteredTasks = project?.tasks?.filter((task: Task) => {
    if (filterStatus === "all") return true;
    return task.status === filterStatus;
  }) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "low";
      case "MEDIUM": return "medium";
      case "HIGH": return "high";
      case "CRITICAL": return "critical";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO": return <ListTodo className="w-4 h-4" />;
      case "IN_PROGRESS": return <Clock className="w-4 h-4" />;
      case "DONE": return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main className="pt-24 px-4 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded" />
            <div className="h-64 bg-white/5 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Project not found</h2>
          <Link href="/projects">
            <Button variant="cyber" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back Link + Header */}
          <div>
            <Link
              href="/projects"
              className="inline-flex items-center text-sm text-gray-400 hover:text-cyber transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Projects
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white neon-text">
                  {project.name}
                </h1>
                <p className="text-gray-400 mt-1">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
                {isAdmin && (
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => setCreateTaskOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Members Section */}
          <Card className="glass-strong">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-cyber" />
                Team Members ({project.members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.members?.map((member: any) => (
                  <div
                    key={member.user.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-cyber">
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.user.role}
                      </p>
                    </div>
                    {isAdmin && member.user.id !== session?.user?.id && (
                      <button
                        onClick={() => removeMemberMutation.mutate(member.user.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Tasks ({filteredTasks.length})
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyber/50"
                >
                  <option value="all">All Status</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl">
                <ListTodo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task: Task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass rounded-xl p-4 border ${
                      isOverdue(task.dueDate) && task.status !== "DONE"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isOverdue(task.dueDate) && task.status !== "DONE" && (
                            <Badge variant="destructive" className="text-[10px]">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-400 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {task.status.replace("_", " ")}
                          </span>
                          {task.assignee && (
                            <span>Assigned to: {task.assignee.name}</span>
                          )}
                          {task.dueDate && (
                            <span>Due: {formatDate(task.dueDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.assignee?.id === session?.user?.id && (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                status: e.target.value,
                              })
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Create Task Modal */}
      <AnimatePresence>
        {createTaskOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setCreateTaskOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md border border-cyber/20"
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Task</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createTaskMutation.mutate(newTask);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyber/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyber/50 resize-none"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyber/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Assignee</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m: any) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCreateTaskOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="cyber" className="flex-1">
                    Create Task
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
