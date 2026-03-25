# Contributing to Open Sermon

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/your-username/open-sermon.git
cd open-sermon
npm install
cp .env.example .env.local
# Fill in your .env.local values
npm run dev
```

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/verse-block` |
| Bug fix | `fix/description` | `fix/editor-crash` |
| Docs | `docs/description` | `docs/update-readme` |
| Refactor | `refactor/description` | `refactor/block-types` |

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add illustration block with AI option
fix: verse modal not closing on mobile
docs: update self-hosting instructions
```

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make sure the app runs locally without errors (`npm run dev`)
3. Add/update tests if applicable
4. Open a PR with a clear description of what changed and why

## Code Style

- TypeScript strict mode
- Tailwind for all styling (no inline styles)
- All files and folders: kebab-case (`verse-block.tsx`, `bible-api.ts`)
- Exported component names: PascalCase inside the file (`export function VerseBlock`)
- Hooks: `use-` prefix + kebab-case (`use-sermon.ts`, `use-bible-search.ts`)

## Reporting Issues

Use GitHub Issues. Include:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, browser)

---

Questions? Open a Discussion on GitHub.
