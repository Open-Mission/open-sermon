<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Open Sermon — Agent Instructions

## Project Overview
Open-source sermon preparation tool for pastors. Next.js 16 (App Router + Turbopack) with Supabase, TipTap editor, Tailwind CSS + shadcn/ui, and API.Bible integration.

## Build / Dev / Lint Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (next/core-web-vitals + typescript) |

No test runner is configured yet. When adding tests, prefer Vitest or Playwright.

## Environment Setup

1. Copy `env.example` to `.env.local` and fill in values
2. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `API_BIBLE_KEY`
3. Docker: `docker compose up` runs app on `http://localhost:3000`

## Code Style

### TypeScript
- **Strict mode** enabled in `tsconfig.json`
- Use `type` for type imports: `import type { Metadata } from "next"`
- Avoid `any`; use proper types or `unknown`
- Prefer `interface` for object shapes, `type` for unions/intersections

### Files & Folders
- All files/folders: **kebab-case** (`verse-block.tsx`, `bible-api.ts`, `use-sermon.ts`)
- Components: PascalCase inside file (`export function VerseBlock`)
- Hooks: `use-` prefix + kebab-case filename (`hooks/use-mobile.ts`)

### Imports
- Use `@/` path alias for all internal imports (`@/components/ui/button`, `@/lib/utils`)
- Group imports: React → Next.js → third-party → internal (`@/`)
- Use `import * as React from "react"` pattern for React
- UI components: import from `@/components/ui/`

### Styling
- **Tailwind CSS only** — no inline styles, no CSS modules for components
- Use `cn()` from `@/lib/utils` for conditional classes (`clsx` + `tailwind-merge`)
- shadcn/ui components in `components/ui/` — add with `npx shadcn@latest add <component>`

### Components
- shadcn/ui style: `class-variance-authority` for variants, `radix-ui` primitives
- Export component + variants: `export { Button, buttonVariants }`
- Use `data-slot` and `data-variant` attributes for testing/styling hooks

## Project Structure

```
app/                    # Next.js App Router (RSC by default)
├── [locale]/           # i18n routing (en, pt-BR)
├── (auth)/             # Auth pages (login, register)
├── (app)/              # Protected routes
└── api/                # API routes
components/
├── ui/                 # shadcn/ui primitives (DO NOT modify directly)
├── editor/             # TipTap editor + custom blocks
└── shared/             # App-specific shared components
lib/
├── supabase/           # Client, server, middleware
├── bible-api/          # API.Bible integration
└── utils.ts            # cn() helper
hooks/                  # Custom hooks (use-*.ts)
messages/               # i18n JSON (en.json, pt-BR.json)
db/schemas/             # SQL migrations for Supabase
```

## Supabase Patterns
- Browser client: `lib/supabase/client.ts` using `@supabase/ssr`
- Server client: `lib/supabase/server.ts`
- Middleware: `lib/supabase/middleware.ts` for auth refresh
- Migrations: `db/schemas/*.sql` (apply via Supabase dashboard or CLI)

## Conventions
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Branch names**: `feat/description`, `fix/description`
- **No comments** unless explicitly requested
- **i18n**: All user-facing strings must use next-intl; translation files in `messages/`
- **Exports**: Named exports preferred; default exports only for page/layout files
- **React Server Components**: Default to RSC; add `"use client"` only when needed (interactivity, hooks, browser APIs)

## shadcn/ui

Configured with `components.json` using `radix-lyra` style, `hugeicons` icon library.
- Add components: `npx shadcn@latest add button dialog sheet`
- Aliases: `@/components/ui`, `@/lib/utils`, `@/hooks`

## Testing

No test runner is configured. When adding tests:
- **Unit/Component tests**: Use Vitest with React Testing Library
- **E2E tests**: Use Playwright
- Run single test: `npx vitest run <file>` or `npx playwright test <file>`
- Run tests in watch mode: `npx vitest`
- Add test files alongside components with `.test.ts` or `.test.tsx` suffix

## Error Handling

### Server Actions & API Routes
- Always use `try/catch` with proper error logging
- Return typed responses using `ResponseJson` utility
- Never expose internal error details to clients
- Use error codes for client-side handling: `{ error: { code: 'VALIDATION_ERROR', message: '...' } }`

### Client Components
- Use `sonner` for toast notifications (import from `@/components/ui/sonner`)
- Handle async operations with proper loading states
- Prefer `useActionState` for form submissions with server actions

### Database Errors
- Wrap Supabase operations in try/catch
- Log errors server-side with context
- Return user-friendly messages: `"Unable to save. Please try again."`

## API Routes & Server Actions

### Route Handlers (`app/api/*`)
- Use `NextRequest`/`NextResponse` for HTTP handlers
- Validate all inputs with Zod schemas
- Return JSON responses with proper status codes
- Example: `return NextResponse.json({ data: ... }, { status: 200 })`

### Server Actions (`app/actions/*`)
- Mark with `'use server'` at function top
- Use Zod for input validation
- Return typed results, not raw data
- Reusable across components and API routes

## Database (Supabase)

### Queries
- Always use typed queries via Supabase generated types
- Prefer `.select()` chains with explicit columns: `.select('id, name, created_at')`
- Use `.eq()`, `.in()`, `.gte()` for filters
- Implement pagination for large datasets with `.range()`

### Migrations (`db/schemas/`)
- Name files: `001_add_users_table.sql`
- Include `up` and `down` logic for reversibility
- Never modify existing migrations; create new ones
- Apply via Supabase CLI: `supabase db push` or dashboard

### RLS (Row Level Security)
- All tables MUST have RLS policies
- Create policies for: SELECT, INSERT, UPDATE, DELETE
- Use `auth.uid()` for user-specific data
- Test policies after creation

## TipTap Editor

### Extensions
- Custom extensions in `components/editor/extensions/`
- Use unique IDs for node views: `nodeViewProps?.node.attrs.id`
- Store content as JSON, not HTML

### Collaboration & State
- Use `EditorContent` component with `useEditor` hook
- Serialize with `editor.getJSON()` for storage
- Handle placeholder via `@tiptap/extension-placeholder`

## Internationalization (i18n)

- All user-facing strings MUST use `next-intl`
- Translation files in `messages/en.json`, `messages/pt-BR.json`
- Use `useTranslations` hook in client components
- Use `getTranslations` in Server Components
- Namespace keys by feature: `sermon.title`, `sermon.save`
- Avoid hardcoded strings; always translate

## Form Validation

- Use **Zod** for all form schemas
- Define schemas in separate files: `lib/schemas/sermon.ts`
- Reuse schemas between client (React Hook Form) and server (server actions)
- Example:
  ```typescript
  const SermonSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().optional(),
  });
  ```

## Performance & Best Practices

- Use React Server Components by default; add `"use client"` only when needed
- Implement `loading.tsx` for route segments
- Use `Suspense` for async data dependencies
- Optimize images with `next/image`
- Font optimization with `next/font/google`
- Minimize client bundle: keep data fetching on server

## Git Conventions

- **Branch names**: `feat/sermon-editor`, `fix/api-timeout`, `refactor/auth-flow`
- **Commits**: Conventional Commits
  - `feat: add sermon outline view`
  - `fix: resolve Bible API timeout`
  - `docs: update API usage guide`
  - `refactor: simplify editor state`
- **PRs**: Clear title, description, testing steps
