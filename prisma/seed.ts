// ============================================================
// DATABASE SEED SCRIPT
// ============================================================
// Run with: npx tsx prisma/seed.ts
// Creates demo data for testing:
// - 1 Admin user
// - 1 Member user
// - 2 Projects with tasks
//
// Default credentials:
// Admin: admin@nebula.com / admin123
// Member: member@nebula.com / member123
// ============================================================

import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@nebula.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create member user
  const memberPassword = await bcrypt.hash("member123", 12);
  const member = await prisma.user.create({
    data: {
      name: "Member User",
      email: "member@nebula.com",
      password: memberPassword,
      role: "MEMBER",
    },
  });
  console.log(`✅ Created member: ${member.email}`);

  // Create Project 1: Website Redesign
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of the company website with modern UI/UX",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id },
        ],
      },
      tasks: {
        create: [
          {
            title: "Design homepage mockup",
            description: "Create Figma mockups for the new homepage",
            status: "DONE",
            priority: "HIGH",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
            assigneeId: member.id,
          },
          {
            title: "Implement navigation component",
            description: "Build responsive navigation with mobile menu",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
            assigneeId: member.id,
          },
          {
            title: "Set up CI/CD pipeline",
            description: "Configure GitHub Actions for automated deployment",
            status: "TODO",
            priority: "CRITICAL",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
            assigneeId: admin.id,
          },
          {
            title: "Write unit tests",
            description: "Achieve 80% code coverage with Jest",
            status: "TODO",
            priority: "LOW",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
          },
        ],
      },
    },
  });
  console.log(`✅ Created project: ${project1.name}`);

  // Create Project 2: Mobile App
  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App v2.0",
      description: "Next version of the mobile application with new features",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id },
        ],
      },
      tasks: {
        create: [
          {
            title: "User authentication flow",
            description: "Implement OAuth2 login with biometric support",
            status: "IN_PROGRESS",
            priority: "HIGH",
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
            assigneeId: admin.id,
          },
          {
            title: "Push notifications",
            description: "Integrate Firebase Cloud Messaging",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
            assigneeId: member.id,
          },
          {
            title: "Performance optimization",
            description: "Reduce bundle size and improve load times",
            status: "TODO",
            priority: "LOW",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            creatorId: admin.id,
          },
        ],
      },
    },
  });
  console.log(`✅ Created project: ${project2.name}`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📧 Demo credentials:");
  console.log("   Admin:  admin@nebula.com / admin123");
  console.log("   Member: member@nebula.com / member123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
