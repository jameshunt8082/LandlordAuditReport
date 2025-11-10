# Landlord Audit System

A professional landlord compliance auditing and reporting system built with Next.js 14, TypeScript, and Vercel Postgres.

## Features

- **Auditor Authentication**: Secure registration and login system
- **Audit Management**: Create and manage landlord audits with unique shareable links
- **Landlord Form**: Clean, mobile-responsive form with 27 compliance questions
- **Automated Scoring**: Traffic light system (red/yellow/green) based on compliance levels
- **Review Interface**: Comprehensive review panel with scores, risk levels, and recommended actions
- **PDF Reports**: Generate professional audit reports (coming soon)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Vercel Postgres
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for Postgres database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LandlordAuditReport
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables (see [docs/environment-setup.md](docs/environment-setup.md)):
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run database migration:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Auditor dashboard (protected)
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── audit/[token]/     # Public landlord form
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── db/                    # Database files
│   ├── schema.sql        # Database schema
│   └── migrate.ts        # Migration script
├── docs/                  # Documentation
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/               # Static assets
```

## Development Status

### ✅ Completed Phases

All core functionality has been implemented and is ready for testing:

- **Phase 1: Setup** ✓
  - Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

- **Phase 2: Authentication** ✓
  - NextAuth.js, registration, login, protected routes

- **Phase 3: Database** ✓
  - Schema, migrations, TypeScript types

- **Phase 4: Auditor Dashboard** ✓
  - Create audits, unique links, audit list, statistics

- **Phase 5: Landlord Form** ✓
  - 27-question form, multi-category navigation, validation, submission

- **Phase 6: Review Interface** ✓
  - Score calculation, traffic lights, risk levels, recommended actions

- **Phase 7: Testing** ✓
  - Comprehensive test documentation and procedures

### 🚧 Future Enhancements

- **PDF Generation**: Report structure needs to be defined, then implementation with @react-pdf/renderer
- **Email Notifications**: Optional feature for future implementation
- **Advanced Analytics**: Historical data and trends

## Documentation

- [Environment Setup](docs/environment-setup.md)
- [Development Prompt](docs/development-prompt.md)

## License

Private project - All rights reserved
