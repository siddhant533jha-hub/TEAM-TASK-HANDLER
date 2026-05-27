"use client";

// ============================================================
// NAVIGATION BAR
// ============================================================
// Glassmorphism navbar with:
// - App branding with neon glow
// - Navigation links (conditional on auth)
// - User menu with role badge
// - Logout functionality
// ============================================================

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  User,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Zap className="w-7 h-7 text-cyber" />
              <div className="absolute inset-0 blur-lg bg-cyber/50 rounded-full" />
            </motion.div>
            <span className="text-xl font-bold text-white neon-text">
              NEBULA
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-cyber/10 text-cyber border border-cyber/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber/30 to-purple-500/30 flex items-center justify-center border border-cyber/30">
                    <User className="w-4 h-4 text-cyber" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-white">
                      {session.user.name}
                    </span>
                    <Badge
                      variant={session.user.role === "ADMIN" ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {session.user.role}
                    </Badge>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass-strong rounded-xl border border-white/10 shadow-2xl py-2"
                    >
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-medium text-white">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: "/login" });
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="cyber">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
