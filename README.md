# FinSight India

Personal finance and tax planning app for Indian professionals.

## Features

- 🧮 **Tax Calculator** - Old & New regime comparison (FY 2025-26)
- 💰 **Expense Tracker** - Track and categorize expenses
- 🤖 **AI Advisor** - Financial advice powered by Google Gemini
- 📰 **News Feed** - Latest financial news
- 👥 **Admin Panel** - User management with RBAC

## Tech Stack

Next.js 16 • React 19 • TypeScript • Tailwind CSS • Prisma • PostgreSQL • Better Auth • Bun

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run migrations
bunx prisma migrate dev

# Start dev server
bun dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"
NEWS_API_KEY="your-news-api-key"
BETTER_AUTH_SECRET="openssl rand -base64 32"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database

```bash
# Development
bunx prisma migrate dev

# Production (Neon, etc.)
bunx prisma migrate deploy

# View data
bunx prisma studio
```

## Create Admin

```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'your@email.com';
```



