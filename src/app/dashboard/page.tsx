"use client";

// ============================================================
// DASHBOARD PAGE - FUTURISTIC 3D-INTEGRATED DASHBOARD
// ============================================================
// This is the main dashboard featuring:
// - 3D particle background (React Three Fiber)
// - Animated stat cards with glassmorphism
// - Interactive charts (Recharts)
// - Task distribution visualization
// - Overdue task alerts
// - Recent activity feed
// - Progress indicators with Framer Motion
//
// Uses TanStack Query for data fetching with caching.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderOpen,
  ListTodo,
  TrendingUp,
  Activity,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticleBackground } from "@/components/3d/particle-background";
import { Navbar } from "@/components/navbar";
import { formatDateTime, isOverdue } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// Stat card component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-strong hover:border-cyber/30 transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            {title}
          </CardTitle>
          <div
            className="p-2 rounded-lg bg-opacity-10"
            style={{ backgroundColor: color + "20" }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white neon-text">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
              <ArrowUpRight className="w-3 h-3" />
              {trend}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Progress ring component
function ProgressRing({
  percentage,
  color,
  size = 60,
}: {
  percentage: number;
  color: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

// Overdue alert banner
function OverdueBanner({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong border border-red-500/30 rounded-xl p-4 flex items-center gap-4"
    >
      <div className="p-2 bg-red-500/10 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-red-400">
          {count} Overdue Task{count > 1 ? "s" : ""}
        </h3>
        <p className="text-xs text-gray-400">
          Tasks past their due date need immediate attention
        </p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const overview = data?.data?.overview;
  const statusDistribution = data?.data?.statusDistribution || [];
  const tasksPerProject = data?.data?.tasksPerProject || [];
  const recentActivity = data?.data?.recentActivity || [];

  const COLORS = ["#fbbf24", "#3b82f6", "#22c55e"];

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-4xl font-bold text-white neon-text">
              Command Center
            </h1>
            <p className="text-gray-400">
              Real-time overview of your projects and tasks
            </p>
          </motion.div>

          {/* Overdue Alert */}
          {overview && <OverdueBanner count={overview.overdueTasks} />}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Projects"
              value={overview?.totalProjects || 0}
              icon={FolderOpen}
              color="#00f0ff"
              subtitle={`${overview?.activeProjects || 0} active`}
            />
            <StatCard
              title="Total Tasks"
              value={overview?.totalTasks || 0}
              icon={ListTodo}
              color="#8b5cf6"
              subtitle={`${overview?.todoTasks || 0} pending`}
            />
            <StatCard
              title="In Progress"
              value={overview?.inProgressTasks || 0}
              icon={Clock}
              color="#3b82f6"
              trend="Active work"
            />
            <StatCard
              title="Completed"
              value={overview?.doneTasks || 0}
              icon={CheckCircle2}
              color="#22c55e"
              trend={`${overview?.completionRate || 0}% completion rate`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyber" />
                    Task Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown by current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(10, 10, 15, 0.9)",
                          border: "1px solid rgba(0, 240, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tasks Per Project */}
            <motion.div variants={itemVariants}>
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyber" />
                    Tasks by Project
                  </CardTitle>
                  <CardDescription>
                    Task volume across projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tasksPerProject}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(10, 10, 15, 0.9)",
                          border: "1px solid rgba(0, 240, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="tasks"
                        fill="#00f0ff"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Row: Completion Progress + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion Progress */}
            <motion.div variants={itemVariants}>
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Completion Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <ProgressRing
                    percentage={overview?.completionRate || 0}
                    color="#22c55e"
                    size={120}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyber" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {recentActivity.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        No recent activity
                      </p>
                    ) : (
                      recentActivity.map((activity: any, index: number) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {activity.status === "DONE" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : activity.status === "IN_PROGRESS" ? (
                              <Clock className="w-5 h-5 text-blue-400" />
                            ) : (
                              <ListTodo className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {activity.project?.name} •{" "}
                              {activity.assignee?.name || "Unassigned"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              activity.status === "DONE"
                                ? "done"
                                : activity.status === "IN_PROGRESS"
                                ? "inProgress"
                                : "todo"
                            }
                          >
                            {activity.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(activity.updatedAt)}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
