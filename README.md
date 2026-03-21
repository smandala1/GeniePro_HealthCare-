# GeniePro Healthcare

A modern full-stack healthcare staffing platform that connects qualified nurses, allied health workers, nonclinical staff, and pharma professionals with top-tier healthcare facilities across the United States.

---

## Overview

GeniePro Healthcare eliminates the middleman in healthcare hiring. Candidates apply directly to verified positions in seconds — no redirects, no repeated resume uploads, no waiting. Recruiters and administrators manage the full hiring pipeline from a purpose-built dashboard.

---

## Features

### For Candidates
- Browse and filter open healthcare jobs by specialty, type, location, and salary
- One-click application modal with resume and certificate uploads
- Track application status through a visual pipeline (Applied → Screening → Interview → Offer → Hired)
- Save jobs and manage a personal profile
- Refer friends and colleagues via a unique referral link
- Leave reviews and testimonials

### For Recruiters
- Post and manage job listings
- Kanban-style pipeline to track candidates through each hiring stage
- Browse and filter a full candidate database
- Message candidates directly
- Company profile management

### For Admins
- Full user, job, recruiter, and candidate management
- Analytics dashboard
- Content management
- Review moderation (approve / reject testimonials)
- **Ceipal ATS Integration** — sync jobs directly from Ceipal into the platform with one click

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) — JWT, role-based (ADMIN / RECRUITER / CANDIDATE) |
| Database | SQLite via [Prisma ORM](https://www.prisma.io/) + `@prisma/adapter-libsql` |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| File Uploads | Native file input with client-side validation |
| ATS Integration | Ceipal ATS v1 API |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/smandala1/GeniePro_HealthCare-.git
cd GeniePro_HealthCare-
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Database
DATABASE_URL="file:./dev.db"

# Ceipal ATS (optional)
CEIPAL_API_URL=https://api.ceipal.com/v1
CEIPAL_USERNAME=your_ceipal_email@example.com
CEIPAL_PASSWORD=your_ceipal_password
CEIPAL_API_KEY=your_ceipal_api_key
NEXT_PUBLIC_ENABLE_CEIPAL=false
```

### Database Setup

```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts   # optional: seed with demo data
```

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── api/          # Route handlers (auth, jobs, applications, ceipal, reviews, referrals)
│   ├── auth/         # Login & registration pages
│   ├── dashboard/    # Role-based dashboards (admin, recruiter, candidate)
│   └── jobs/         # Public job listings page
├── components/
│   ├── landing/      # Home page sections (Hero, About, Reviews, Referral, etc.)
│   ├── layout/       # Sidebar, Navbar, Footer
│   └── ui/           # Shared UI primitives (Card, Badge, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, Prisma client, auth config, Ceipal service
├── middleware.ts     # Route protection by role
└── types/            # Shared TypeScript types
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Demo seed data
```

---

## Ceipal ATS Integration

GeniePro supports syncing job postings directly from [Ceipal ATS](https://www.ceipal.com/). When configured:

1. Navigate to **Admin → Integrations**
2. Set filter options (days posted, job status)
3. Click **Sync Jobs from Ceipal**

Jobs are upserted into the local database and become immediately visible on the platform. The integration uses token-based authentication with automatic refresh.

---

## License

Private — all rights reserved.