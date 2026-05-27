// ============================================================
// PRISMA CLIENT SINGLETON
// ============================================================
// We use a singleton pattern to prevent multiple Prisma Client
// instances in development (Next.js hot reload creates new instances).
// In production, this is a standard single instance.
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
