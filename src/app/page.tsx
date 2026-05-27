"use client";

// ============================================================
// LANDING PAGE
// ============================================================
// Futuristic landing page with 3D elements and CTA to login/signup
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Users, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/3d/particle-background";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "JWT-based auth with bcrypt password hashing and role-based access control.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Create projects, invite team members, and assign tasks with full RBAC.",
  },
  {
    icon: BarChart3,
    title: "3D Dashboard",
    description: "Futuristic dashboard with real-time analytics, charts, and 3D visualizations.",
  },
  {
    icon: Globe,
    title: "Cloud Ready",
    description: "Built for Railway deployment with PostgreSQL, Prisma, and Next.js.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      {/* Hero Section */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-cyber" />
            <span className="text-2xl font-bold text-white neon-text">
              NEBULA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-cyber">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="cyber">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Project Management
              <br />
              <span className="neon-text text-cyber">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              A futuristic project management platform with 3D visualizations,
              role-based access control, and real-time analytics.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  variant="cyber"
                  className="px-8 py-6 text-lg flex items-center gap-2"
                >
                  Launch Command Center
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-strong rounded-xl p-6 hover:border-cyber/30 transition-all duration-300 group"
                >
                  <div className="p-3 bg-cyber/10 rounded-lg w-fit mb-4 group-hover:bg-cyber/20 transition-colors">
                    <Icon className="w-6 h-6 text-cyber" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-500">
              Built with Next.js, Prisma, PostgreSQL, Three.js & Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
