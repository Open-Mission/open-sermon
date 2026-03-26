# Open Sermon — Project Documentation

> Context for future development sessions.

## Overview

Open-source sermon preparation tool for pastors. Built with Next.js 16 (App Router + Turbopack), Supabase, TipTap editor, Tailwind CSS + shadcn/ui, and API.Bible integration.

**Status:** Auth + Dashboard implemented. Sermon editor, series, and library are next.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password + magic link) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| i18n | next-intl (locales: `pt`, `en`, default: `pt`) |
| Editor | TipTap (planned) |
| Bible API | scripture.api.bible |

## Project Structure

```
app/
├── layout.tsx                    # Root layout (html/body, fonts, lang from locale param)
├── globals.css                   # Tailwind + shadcn theme variables
├── [locale]/
│   ├── layout.tsx                # Locale layout (NextIntlClientProvider, no html/body)
│   ├── (auth)/                   # Public auth pages
│   │   ├── layout.tsx            # Centered card layout
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── login-form.tsx    # Password + Magic Link tabs
│   │   └── register/
│   │       ├── page.tsx
│   │       └── register-form.tsx # Email/password registration
│   ├── (app)/                    # Protected routes
│   │   ├── layout.tsx            # Header with user email + sign out
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard with sermon/series/library cards
│   └── auth/
│       └── callback/
│           └── route.ts          # Magic link callback (exchanges code for session)
├── auth/
│   └── callback/
│       └── route.ts              # (DELETED — moved under [locale])
components/
├── ui/                           # 55+ shadcn/ui primitives
├── locale-switcher.tsx           # Locale switcher component
lib/
├── supabase/
│   ├── client.ts                 # Browser client (@supabase/ssr)
│   ├── server.ts                 # Server client (cookies-based)
│   ├── middleware.ts             # updateSession helper (not used — proxy.ts handles it)
│   └── actions.ts                # Server actions: signIn, signUp, signInWithMagicLink, signOut
├── utils.ts                      # cn() helper
├── bible-api/                    # API.Bible integration (planned)
i18n/
├── routing.ts                    # defineRouting({ locales: ["pt", "en"], defaultLocale: "pt" })
├── request.ts                    # getRequestConfig for next-intl
└── navigation.ts                 # createNavigation: Link, redirect, usePathname, useRouter
messages/
├── en.json                       # English translations
└── pt.json                       # Portuguese translations
db/
└── schemas/
    └── 00-initial-schema.sql     # Initial DB schema
proxy.ts                          # Auth + i18n middleware (Next.js 16 convention)
```

## Routing & Middleware

`proxy.ts` is the single middleware entry point (Next.js 16 convention, no `middleware.ts`).

**Flow:**
1. `/auth/*` routes → pass through to Next.js route handlers
2. Protected routes (`/dashboard`, `/sermon`, `/series`, `/library`) → check Supabase session, redirect to `/{locale}/login` if unauthenticated
3. All other routes → `intlMiddleware` handles locale prefixing

**Protected routes:**
```
/dashboard, /sermon, /series, /library
```

**Locale-aware navigation** uses `@/i18n/navigation` (created via `createNavigation` from `next-intl`):
```ts
import { Link, redirect, usePathname, useRouter } from "@/i18n/navigation";
```

## Authentication

### Server Actions (`lib/supabase/actions.ts`)

| Action | Params | Behavior |
|--------|--------|----------|
| `signIn` | email, password, locale (form data) | Email/password login, redirects to `/{locale}/dashboard` |
| `signUp` | email, password (form data) | Creates account, returns success state |
| `signInWithMagicLink` | email, origin, locale (form data) | Sends magic link to `/{locale}/auth/callback` |
| `signOut` | none | Signs out, redirects to `/login` |

### Auth Flow

**Email/Password:**
1. User submits login form → `signIn` server action
2. `supabase.auth.signInWithPassword()` validates credentials
3. Redirect to `/{locale}/dashboard`

**Magic Link:**
1. User submits email → `signInWithMagicLink` server action
2. `supabase.auth.signInWithOtp()` sends email with link to `/{origin}/{locale}/auth/callback`
3. User clicks link → lands on `app/[locale]/auth/callback/route.ts`
4. Route handler exchanges `code` for session via `supabase.auth.exchangeCodeForSession()`
5. Redirect to `/{locale}/dashboard`

**Registration:**
1. User submits form → `signUp` server action
2. `supabase.auth.signUp()` creates account (may require email confirmation)
3. UI shows success message, links to login

### Key Implementation Details

- Login form uses `useActionState` for pending/error states
- Magic link origin is set via `useRef` + `useEffect` (avoids hydration mismatch from `typeof window` check)
- Locale is passed as hidden form input to server actions
- `proxy.ts` passes through `/auth/*` routes before `intlMiddleware` to prevent redirect loops

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_BIBLE_KEY=your-api-bible-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

> The project uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `ANON_KEY`). Both work in Supabase but code is standardized to `PUBLISHABLE_KEY`.

## Database Schema

**Extension:**
- `uuid-ossp` for UUID generation

### Tables

#### `public.series`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| user_id | uuid | — | FK → auth.users, cascade delete |
| title | text | — | NOT NULL |
| description | text | — | nullable |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | auto-updated via trigger |

#### `public.sermons`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| user_id | uuid | — | FK → auth.users, cascade delete |
| series_id | uuid | — | FK → series, set null on delete |
| title | text | — | NOT NULL |
| slug | text | — | nullable |
| status | sermon_status | 'draft' | enum: draft, in_progress, finished, preached |
| type | sermon_type | 'preaching' | enum: preaching, cell, devotional |
| main_scripture | text | — | nullable |
| tags | text[] | '{}' | |
| blocks | jsonb | '[]' | Editor block content (TipTap) |
| preached_at | date | — | nullable |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | auto-updated via trigger |

#### `public.saved_blocks`
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | uuid_generate_v4() | PK |
| user_id | uuid | — | FK → auth.users, cascade delete |
| type | block_type | — | enum: verse, illustration, application, point, intro, conclusion, text |
| title | text | — | NOT NULL |
| content | jsonb | — | NOT NULL |
| tags | text[] | '{}' | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | auto-updated via trigger |

### Custom Types

```sql
sermon_status  = enum('draft', 'in_progress', 'finished', 'preached')
sermon_type    = enum('preaching', 'cell', 'devotional')
block_type     = enum('verse', 'illustration', 'application', 'point', 'intro', 'conclusion', 'text')
```

### Row Level Security

All tables have RLS enabled. Each table has 4 policies (SELECT, INSERT, UPDATE, DELETE) scoped to `auth.uid() = user_id`.

### Triggers

`update_updated_at()` function runs `BEFORE UPDATE` on `sermons`, `series`, `saved_blocks`.

## i18n

**Locales:** `pt` (default), `en`

**Translation structure** (`messages/{locale}.json`):
```json
{
  "common": { "appName", "loading", "save", "cancel", "logout", ... },
  "auth": { "login", "register", "email", "password", "loginTitle", "magicLinkTab", ... },
  "dashboard": { "title", "welcome", "newSermon", "series", "library", ... },
  "sermon": { ... },
  "editor": { ... },
  "series": { ... },
  "library": { ... }
}
```

## shadcn/ui

- **Style:** radix-lyra
- **Icon library:** hugeicons
- **55+ components** installed in `components/ui/`
- **Supabase components** installed via `npx shadcn@latest add @supabase/supabase-client-nextjs`
- Add new components: `npx shadcn@latest add <component>`

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Known Issues / Notes

- `lib/supabase/middleware.ts` exports `updateSession()` but is **not used** — `proxy.ts` handles session management
- `globals.css` indentation is 4 spaces (shadcn default) while code is 2 spaces
- Pre-existing lint warnings in `locale-switcher.tsx` (unused var) and `i18n/request.ts` (`any` type)
