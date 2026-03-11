# LoopReminder MVP

A private relationship and follow-up assistant built for a 14-day MVP sprint.

## Stack

- Next.js App Router + TypeScript + Tailwind
- NextAuth (Credentials) for MVP auth
- PostgreSQL (Supabase-compatible) via `pg`
- Prisma schema kept in-repo for data model reference
- Resend for morning emails
- OpenAI for draft generation (with local fallback if missing key)

## Setup

1. Install deps:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

3. Initialize database schema:

```bash
npm run db:init
```

4. Optional dev seed data:

```bash
npm run db:seed
```

5. Run app:

```bash
npm run dev
```

## Fixed MVP scope (locked)

### Item types

- `important_date`
- `follow_up`

### Dashboard sections

- `today`
- `coming_up`
- `overdue`

### Morning brief window

- Next 7 days

### Draft tones

- `warm`
- `casual`
- `formal`

### Snooze options

- `tomorrow`
- `next week`

## Implemented features

- Sign in + protected app pages
- People CRUD (`/api/people`)
- Item CRUD (`/api/items`)
- Dashboard grouping logic (`/api/dashboard`)
- Item actions: done/snooze/draft
- Person detail page (`/people/[id]`)
- Settings page for morning brief preferences
- Manual morning brief trigger (`POST /api/dev/send-morning-brief`)
- Cron route for daily brief sends (`GET /api/cron/morning-brief`)

## API overview

- `GET/POST /api/people`
- `PATCH/DELETE /api/people/:id`
- `GET/POST /api/items`
- `PATCH/DELETE /api/items/:id`
- `POST /api/items/:id/done`
- `POST /api/items/:id/snooze`
- `POST /api/items/:id/draft`
- `GET /api/dashboard`
- `GET/POST /api/settings`
- `POST /api/dev/send-morning-brief`
- `GET /api/cron/morning-brief`

## Out of scope

- Mobile app
- Widgets
- Push notifications
- Calendar sync
- Holiday packs
- Chat integrations
- Auto-sending messages
