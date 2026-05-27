"use client";

// ============================================================
// PROJECTS PAGE
// ============================================================
// Full CRUD for projects with:
// - List view with task summaries
// - Create project modal (ADMIN only)
// - Delete project (ADMIN only)
// - Member management (ADMIN only)
// - Project detail navigation
//
// RBAC:
// - ADMIN: Full CRUD, member management
// - MEMBER: View-only access to their projects
// ============================================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { ParticleBackground } from "@/components/3d/particle-background";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { tasks: number; members: number };
  taskSummary: {
    todo: number;
    inProgress: number;
    done: number;
    total: number;
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "ADMIN";

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");

  // Fetch projects
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const projects: Project[] = projectsData?.data || [];

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setCreateModalOpen(false);
      setNewProject({ name: "", description: "" });
      setFormError("");
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteConfirm(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      setFormError("Project name is required");
      return;
    }
    createMutation.mutate(newProject);
  };

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white neon-text">
                Projects
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your projects and teams
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="cyber"
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber/50 transition-all"
            />
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 glass rounded-xl animate-pulse bg-white/5"
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-400">
                {isAdmin
                  ? "Create your first project to get started"
                  : "You haven't been added to any projects yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-strong hover:border-cyber/30 transition-all duration-300 group h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg text-white group-hover:text-cyber transition-colors">
                            {project.name}
                          </CardTitle>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirm(project.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        {/* Task Summary */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 rounded-lg bg-yellow-500/5">
                            <ListTodo className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                            <span className="text-lg font-bold text-yellow-400">
                              {project.taskSummary.todo}
                            </span>
                            <p className="text-[10px] text-gray-500">To Do</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-blue-500/5">
                            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                            <span className="text-lg font-bold text-blue-400">
                              {project.taskSummary.inProgress}
                            </span>
                            <p className="text-[10px] text-gray-500">Active</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-green-500/5">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
                            <span className="text-lg font-bold text-green-400">
                              {project.taskSummary.done}
                            </span>
                            <p className="text-[10px] text-gray-500">Done</p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project._count.members} members
                          </div>
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {project.status}
                          </Badge>
                        </div>

                        {/* View Button */}
                        <Link href={`/projects/${project.id}`}>
                          <Button
                            variant="outline"
                            className="w-full mt-3 border-cyber/30 text-cyber hover:bg-cyber/10"
                          >
                            View Project
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md border border-cyber/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Create New Project
                </h2>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber/50 transition-all"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber/50 transition-all resize-none"
                    rows={3}
                    placeholder="Brief description of the project"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="cyber"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-cyber border-t-transparent rounded-full"
                      />
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-sm border border-red-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Delete Project?
                </h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                This will permanently delete the project and all its tasks.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                  onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
