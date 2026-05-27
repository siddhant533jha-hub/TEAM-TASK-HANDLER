# Nebula Project Manager

> A futuristic, production-ready project management platform built with Next.js 14, Prisma, PostgreSQL, and Three.js.

![Nebula Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css)

## Features

### Authentication & Security
- **JWT-based Authentication** via NextAuth.js with Credentials Provider
- **bcrypt Password Hashing** (salt rounds: 12)
- **Session Management** with automatic refresh
- **Middleware Route Protection** - unauthenticated users redirected to login

### Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| **ADMIN** | Create/delete projects, manage members, assign tasks, full CRUD |
| **MEMBER** | View assigned projects, update own task status, view dashboard |

### Project Management
- Create, read, update, delete projects
- Add/remove project members
- Task summary per project (todo/in-progress/done counts)
- Project status tracking (active/archived)

### Task Management
- Create tasks with title, description, priority, due date
- Assign tasks to project members
- Status tracking: Todo -> In Progress -> Done
- Priority levels: Low, Medium, High, Critical
- Overdue task detection and alerts

### Dashboard
- **3D Particle Background** (React Three Fiber)
- Real-time task distribution charts (Pie + Bar)
- Completion progress ring
- Overdue task alerts
- Recent activity feed
- Auto-refresh every 30 seconds

### Design
- Dark mode sci-fi theme
- Glassmorphism UI components
- Neon cyan accents (#00f0ff)
- Framer Motion animations
- Responsive layout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Animations** | Framer Motion, React Three Fiber (Three.js) |
| **Charts** | Recharts |
| **State** | TanStack Query (React Query) |
| **Auth** | NextAuth.js v4 |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5 |
| **Validation** | Zod |
| **Deployment** | Railway |

---

## Project Structure

```
project-management-app/
├── prisma/
│   ├── schema.prisma          # Database schema with RBAC models
│   └── seed.ts                # Demo data seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts   # NextAuth config
│   │   │   │   └── signup/route.ts          # Registration endpoint
│   │   │   ├── dashboard/route.ts           # Dashboard analytics
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                 # Project CRUD
│   │   │   │   └── [projectId]/
│   │   │   │       ├── route.ts             # Project detail
│   │   │   │       └── members/route.ts     # Member management
│   │   │   └── tasks/
│   │   │       ├── route.ts                 # Task CRUD
│   │   │       └── [taskId]/route.ts        # Task detail
│   │   ├── dashboard/page.tsx               # 3D Dashboard
│   │   ├── login/page.tsx                   # Login page
│   │   ├── signup/page.tsx                  # Signup page
│   │   ├── projects/
│   │   │   ├── page.tsx                     # Projects list
│   │   │   └── [projectId]/page.tsx         # Project detail
│   │   ├── globals.css                      # Global styles
│   │   ├── layout.tsx                       # Root layout
│   │   └── page.tsx                         # Landing page
│   ├── components/
│   │   ├── 3d/
│   │   │   └── particle-background.tsx      # Three.js particles
│   │   ├── ui/                              # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   ├── navbar.tsx                       # Navigation bar
│   │   └── providers.tsx                    # Context providers
│   ├── lib/
│   │   ├── auth.ts                          # NextAuth configuration
│   │   ├── db.ts                            # Prisma client singleton
│   │   ├── api-utils.ts                     # API helpers + RBAC
│   │   ├── utils.ts                         # Utility functions
│   │   └── validations.ts                   # Zod schemas
│   ├── types/
│   │   └── next-auth.d.ts                   # Type extensions
│   └── middleware.ts                        # Route protection
├── .env.example                             # Environment template
├── .env.production                          # Production env template
├── next.config.js                           # Next.js config
├── tailwind.config.js                       # Tailwind theme
├── tsconfig.json                            # TypeScript config
└── package.json
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd project-management-app
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database (local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nebula_db"

# Auth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Frontend
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Credentials:**
- Admin: `admin@nebula.com` / `admin123`
- Member: `member@nebula.com` / `member123`

---

## Deployment on Railway

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Connect your repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **New**
2. Select **Database** -> **Add PostgreSQL**
3. Railway will auto-generate `DATABASE_URL`

### Step 3: Configure Environment Variables

Go to your service **Variables** tab and add:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | Auto-generated | Railway PostgreSQL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Manual |
| `NEXTAUTH_URL` | Your Railway domain | `${{RAILWAY_STATIC_URL}}` |
| `NEXT_PUBLIC_APP_URL` | Your Railway domain | `${{RAILWAY_STATIC_URL}}` |

### Step 4: Set Build & Start Commands

In your service **Settings**:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

### Step 5: Handle Prisma Migrations

Add a **Deploy** start command or use Railway's **Deploy** hook:

**Option A: Start Command (recommended)**
```bash
npx prisma migrate deploy && npm start
```

**Option B: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed data (first time only)
railway run npx tsx prisma/seed.ts
```

### Step 6: Deploy

1. Push code to your connected GitHub repo
2. Railway auto-deploys on push
3. Check **Deployments** tab for status

### Troubleshooting Railway Deployment

**Issue: "Prisma Client not found"**
```bash
# Add to package.json scripts:
"postinstall": "prisma generate"
```

**Issue: "Database connection failed"**
- Verify `DATABASE_URL` is set correctly
- Check Railway PostgreSQL is running
- Ensure SSL mode is handled (Prisma does this automatically)

**Issue: "NEXTAUTH_URL mismatch"**
- Set `NEXTAUTH_URL` to your Railway domain (e.g., `https://your-app.up.railway.app`)
- Do NOT include trailing slash

---

## RBAC Implementation Details

### How It Works

1. **User Model** has a `role` field (ADMIN or MEMBER)
2. **JWT Token** stores the role during authentication
3. **Session** exposes role to the frontend
4. **API Routes** check role before executing actions
5. **Middleware** protects routes at the edge

### Code Flow

```
Login -> JWT created with { id, email, name, role }
   |
Session -> role available in useSession()
   |
API Route -> requireAuth() + requireAdmin() checks
   |
Database -> Prisma queries filtered by user role
```

### Permission Matrix

| Action | ADMIN | MEMBER |
|--------|-------|--------|
| Create Project | Yes | No |
| Delete Project | Yes | No |
| Add/Remove Members | Yes | No |
| Create Task | Yes | No |
| Delete Task | Yes | No |
| Assign Task | Yes | No |
| Update Any Task | Yes | No |
| Update Own Task Status | Yes | Yes |
| View Projects | All | Member-only |
| View Dashboard | All data | Filtered data |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Login with credentials |
| POST | `/api/auth/signout` | Logout |
| POST | `/api/auth/signup` | Register new account |
| GET | `/api/auth/session` | Get current session |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | Any | List accessible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Any | Get project details |
| PATCH | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | Any | List tasks (filtered) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Any | Get task details |
| PATCH | `/api/tasks/:id` | Any | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

Members can only update status of assigned tasks

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | Any | Aggregated analytics |

---

## Validation

All API endpoints use Zod for strict validation:

- **Auth**: Email format, password length (min 6)
- **Projects**: Name required (max 100), description optional (max 500)
- **Tasks**: Title required (max 200), priority enum, status enum
- **Members**: UUID validation for user IDs

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:deploy    # Deploy migrations (prod)
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

---

## License

MIT

---

Built with love for the future of project management.
