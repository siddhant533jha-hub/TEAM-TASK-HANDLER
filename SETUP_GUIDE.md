# NEBULA PROJECT MANAGER - QUICK SETUP GUIDE

## Step-by-Step Local Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ (local or Docker)
- Git

### 1. Initialize Project

```bash
# Create project directory
mkdir nebula-project-manager
cd nebula-project-manager

# Copy all the generated files into this directory
# (Use the file structure provided in the main README)
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL: your PostgreSQL connection string
# - NEXTAUTH_SECRET: run `openssl rand -base64 32` to generate
# - NEXTAUTH_URL: http://localhost:3000
```

### 4. Database Setup

```bash
# Create database (if using local PostgreSQL)
createdb nebula_db

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with demo data
npx tsx prisma/seed.ts
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Demo Login Credentials
- **Admin**: admin@nebula.com / admin123
- **Member**: member@nebula.com / member123

---

## Railway Deployment (Step-by-Step)

### Phase 1: Prepare Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/nebula-project-manager.git
git push -u origin main
```

### Phase 2: Railway Setup

1. Go to https://railway.app and login
2. Click "New Project" -> "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js and start building

### Phase 3: Add PostgreSQL

1. In your project dashboard, click "New"
2. Select "Database" -> "Add PostgreSQL"
3. Wait for provisioning (takes ~30 seconds)
4. Railway auto-injects DATABASE_URL into your service

### Phase 4: Configure Environment Variables

Go to your service -> Variables tab:

```
NEXTAUTH_SECRET = <generate with openssl rand -base64 32>
NEXTAUTH_URL = ${{RAILWAY_STATIC_URL}}
NEXT_PUBLIC_APP_URL = ${{RAILWAY_STATIC_URL}}
```

### Phase 5: Update Start Command

Go to Settings -> Deploy:

```bash
npx prisma migrate deploy && npm start
```

This ensures migrations run before the app starts.

### Phase 6: Deploy

1. Push a new commit to trigger deployment
2. Or click "Deploy" in Railway dashboard
3. Check Logs tab for any errors

### Phase 7: Seed Database (First Time Only)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run seed script
railway run npx tsx prisma/seed.ts
```

### Phase 8: Verify Deployment

1. Visit your Railway domain (shown in dashboard)
2. Login with demo credentials
3. Test all features

---

## Troubleshooting

### Build Errors

**Error: "Cannot find module '@prisma/client'"**
```bash
# Solution: Add postinstall script to package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Error: "Database connection failed"**
- Check DATABASE_URL is correct
- Ensure PostgreSQL service is running
- Check Railway logs for connection details

**Error: "NEXTAUTH_URL must be set"**
- Set NEXTAUTH_URL to your production domain
- Must match the URL you're accessing

### Runtime Errors

**Error: "JWT must be provided"**
- Clear browser cookies and login again
- Check NEXTAUTH_SECRET is set correctly

**Error: "Forbidden" on API calls**
- Check user role in database
- Verify session is valid

---

## Development Tips

### Prisma Studio
```bash
npx prisma studio
```
Visual database editor at http://localhost:5555

### Database Reset
```bash
npx prisma migrate reset
```
⚠️ This deletes all data!

### Adding New API Routes
1. Create file in `src/app/api/your-route/route.ts`
2. Export GET/POST/PATCH/DELETE handlers
3. Use `requireAuth()` for protection
4. Use Zod schemas for validation

### Adding New Pages
1. Create directory in `src/app/your-page/`
2. Add `page.tsx` with "use client" if needed
3. Add to navbar if it should be navigable

---

## Architecture Decisions

### Why JWT Sessions?
- Stateless - no database lookup per request
- Edge-compatible for middleware
- Scales horizontally without sticky sessions

### Why TanStack Query?
- Automatic caching and refetching
- Optimistic updates
- Loading/error states handled declaratively

### Why Prisma?
- Type-safe database queries
- Automatic migration generation
- Excellent PostgreSQL support

### Why Next.js App Router?
- Server components for data fetching
- API routes colocated with pages
- Middleware for route protection

---

## Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Passwords hashed with bcrypt (salt: 12)
- [ ] All API routes validate with Zod
- [ ] RBAC checks on every sensitive operation
- [ ] Middleware protects authenticated routes
- [ ] Database connection uses SSL in production
- [ ] No sensitive data exposed in API responses

---

## Performance Tips

1. **Use React Query caching** - Dashboard refetches every 30s
2. **Prisma connection pooling** - Automatic with PostgreSQL
3. **Next.js image optimization** - Enabled in config
4. **Lazy loading** - Components load on demand
5. **Database indexes** - Added on frequently queried fields

---

## Next Steps / Extensions

- [ ] Add real-time updates with WebSockets
- [ ] Add file attachments to tasks
- [ ] Add email notifications
- [ ] Add project templates
- [ ] Add time tracking
- [ ] Add calendar view
- [ ] Add Kanban board view
- [ ] Add Gantt chart view
- [ ] Add team chat
- [ ] Add API rate limiting

---

Happy building! 🚀
