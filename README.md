# ✝ Open Sermon

**Open-source sermon preparation tool for pastors and cell group leaders.**  
Ferramenta open source para preparação de sermões — pastores, pregadores e líderes de célula.

> Organize, structure, and build a reusable sermon library — with a block-based editor designed for how preachers actually think.

---

## ✨ Features

- 📖 **Block-based editor** — Notion-style blocks with semantic types: Bible verse, illustration, application, point, intro, conclusion
- 🪄 **Slash Commands (/)** — Rapid content creation with a keyboard-first block menu
- 📱 **Mobile & PWA Support** — Fully responsive design and installable as a mobile app
- 📴 **Offline Access** — View and edit your sermons even without an internet connection
- 🔍 **Bible verse search** — Pull text automatically from API.Bible (cached via Redis)
- 📚 **Reusable block library** — Save illustrations, points, and verses for use across sermons
- 🗂️ **Series organization** — Group sermons into thematic series
- ⚡ **Optimized Performance** — Client-side caching (React Query) and server-side caching (Redis)
- 📤 **Export** — PDF and Markdown export for printing or distribution
- 🌐 **i18n** — Fully localized in English and Portuguese (PT-BR)
- 🐳 **Self-hostable** — Docker-ready architecture

---

## 🚀 Quick Start (Self-hosted)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- A [Supabase](https://supabase.com) project (or self-hosted Supabase)
- An [API.Bible](https://scripture.api.bible) key (free)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/open-sermon.git
cd open-sermon
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_BIBLE_KEY=your_api_bible_key
```

### 3. Run with Docker

```bash
docker compose up
```

App will be available at `http://localhost:3000`

### 4. Run locally (dev)

```bash
npm install
npm run dev
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router + Turbopack) |
| Backend / Auth / DB | Supabase (Postgres + Auth) |
| Caching | React Query + Upstash Redis |
| PWA | Standard Web Manifest + Custom Service Worker |
| Editor | TipTap 2.x with custom blocks |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Bible API | API.Bible |
| i18n | next-intl |

---

## 📁 Project Structure

```
open-sermon/
├── app/                        # Next.js App Router
│   ├── [locale]/               # i18n routing
│   │   ├── (auth)/             # Login, register
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── dashboard/      # Home / sermon list
│   │   │   ├── sermon/
│   │   │   │   ├── new/        # Create sermon
│   │   │   │   └── [id]/       # Edit sermon
│   │   │   ├── series/         # Series management
│   │   │   └── library/        # Reusable blocks library
│   │   └── layout.tsx
│   └── api/                    # API routes
│       └── bible/              # Bible verse proxy (API.Bible)
├── components/
│   ├── editor/                 # TipTap editor + custom blocks
│   │   ├── sermon-editor.tsx
│   │   ├── blocks/
│   │   │   ├── verse-block.tsx
│   │   │   ├── illustration-block.tsx
│   │   │   ├── application-block.tsx
│   │   │   ├── point-block.tsx
│   │   │   ├── intro-block.tsx
│   │   │   └── conclusion-block.tsx
│   │   └── block-menu.tsx       # "/" command menu
│   ├── ui/                     # shadcn/ui components
│   └── shared/                 # Shared components
├── lib/
│   ├── supabase/               # Supabase client + server
│   ├── bible-api/              # API.Bible integration
│   └── export/                 # PDF / Markdown export
├── messages/                   # i18n translation files
│   ├── en.json
│   └── pt-BR.json
├── supabase/
│   └── migrations/             # Database migrations
├── .env.example
├── docker-compose.yml
└── README.md
```

---

- [x] Project setup & architecture
- [x] **Phase 1 — MVP**: Block editor, Auth, Dashboard, PWA, Caching
- [ ] **Phase 2 — Performance & UX**: PDF Export, search across library, drag and drop refinement
- [ ] **Phase 3 — Collaboration**: Multi-user teams, sermon sharing, comments
- [ ] **Phase 4 — AI Assistant**: Outline suggestions, semantic search in your library

---

## ☁️ Cloud Version

Don't want to self-host? A managed cloud version is available at **[opensermon.app](https://opensermon.app)** _(coming soon)_.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

```bash
# Fork the repo, then:
git checkout -b feat/your-feature
git commit -m "feat: your feature description"
git push origin feat/your-feature
# Open a Pull Request
```

---

## 📄 License

Licensed under **AGPL-3.0**. See [LICENSE](./LICENSE) for details.

In short: free to use and self-host. If you modify and distribute, you must open-source your changes. Commercial use is permitted — contact us for a commercial license if needed.

---

<p align="center">Built with ✝ for the Church</p>
