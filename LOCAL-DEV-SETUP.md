# Local Development Setup Guide

Complete guide to set up this forked project on your local machine.

---

## Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **npm** 9+ (check with `npm -v`)
- **Vercel Postgres database** (or create one at [vercel.com/storage/postgres](https://vercel.com/storage/postgres))

---

## Step 1: Install Dependencies

```bash
cd /home/nelson/Documents/LandlordAuditReport
npm install
```

---

## Step 2: Create Environment File

Create `.env.local` in the project root with these variables:

```bash
# ============================================
# AUTHENTICATION (REQUIRED)
# ============================================
# Generate a secret: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"

# NextAuth URL (for local dev, use localhost)
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# DATABASE - VERCEL POSTGRES (REQUIRED)
# ============================================
# Get these from: Vercel Dashboard → Storage → Your Database → .env.local tab
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# ============================================
# PDF GENERATION (OPTIONAL - for local PDF testing)
# ============================================
# CHROMIUM_REMOTE_EXEC_PATH=https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br
```

### How to Get Vercel Postgres Credentials
1. Go to [vercel.com](https://vercel.com)
2. Select your project (or create a new one)
3. Go to **Storage** → Select/Create a Postgres database
4. Click **`.env.local`** tab
5. Copy ALL the environment variables

---

## Step 3: Run Database Migrations

> [!NOTE]
> **Joining an existing project?** If another developer already set up the database (tables and seed data exist), **skip this step entirely** and go directly to [Step 4](#step-4-start-development-server). You only need the correct `.env.local` credentials to connect to the shared database.

Run the migrations to create all required tables **(first-time setup only)**:

```bash
# Main tables (users, audits, form_responses, scores, notes)
npm run db:migrate

# Questions system tables
npm run db:migrate:questions

# Seed the questions data
npm run db:seed:questions
```

### Manual SQL (Alternative)
If migrations fail, run these SQL files manually via Vercel Dashboard → Storage → Query:

1. **Core schema**: `db/schema.sql`
2. **Questions schema**: `db/schema-questions.sql`
3. **Comment column**: 
   ```sql
   ALTER TABLE question_templates ADD COLUMN IF NOT EXISTS comment TEXT;
   ALTER TABLE form_responses ADD COLUMN IF NOT EXISTS comment TEXT;
   ```

---

## Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 5: Create First User

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in Name, Email, Password
3. You'll be redirected to the dashboard

---

## Database Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Auditor accounts |
| `audits` | Audit records with client/property info |
| `form_responses` | Landlord answers to questions |
| `scores` | Calculated scores per category |
| `notes` | Auditor notes on questions |
| `question_templates` | Dynamic question definitions |
| `question_answer_options` | Answer choices for each question |
| `question_score_examples` | Guidance text for score levels |

---

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:migrate` | Run main DB migration |
| `npm run db:migrate:questions` | Migrate questions tables |
| `npm run db:seed:questions` | Seed question data |

---

## Troubleshooting

### Error: `MissingSecret: Please define a 'secret'`
➤ Missing `AUTH_SECRET` in `.env.local`. Generate one:
```bash
openssl rand -base64 32
```

### Error: `POSTGRES_URL is not defined`
➤ Missing database env vars. Copy them from Vercel Dashboard.

### Error: `relation "users" does not exist`
➤ Run migrations:
```bash
npm run db:migrate
npm run db:migrate:questions
```

### Error: `No questions found`
➤ Seed the questions:
```bash
npm run db:seed:questions
```

### Landing page redirects to login
➤ This is expected behavior when auth is misconfigured. Fix the `AUTH_SECRET` first.

---

## Quick Verification Checklist

- [ ] `.env.local` created with all variables
- [ ] `AUTH_SECRET` is set (32+ characters)
- [ ] Vercel Postgres credentials are correct
- [ ] `npm run db:migrate` completed successfully
- [ ] `npm run db:migrate:questions` completed successfully  
- [ ] `npm run db:seed:questions` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can register a new user at `/register`
- [ ] Can login and see dashboard

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API endpoints
│   ├── dashboard/         # Protected auditor pages
│   ├── login/             # Auth pages
│   └── audit/[token]/     # Public landlord form
├── components/            # React components
│   ├── payment/           # Payment UI (new)
│   └── ui/                # shadcn/ui components
├── db/                    # Database schemas & migrations
├── lib/                   # Utilities (auth, scoring, PDF)
└── types/                 # TypeScript types
```
