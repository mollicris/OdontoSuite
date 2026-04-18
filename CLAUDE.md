# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OdontoSuite is a dental clinic management web application built with React 19 + TypeScript + Vite. The project is in early development (v0.0.0) — the current codebase is a configured starter template ready for feature development.

## Commands

```bash
npm run dev       # Start dev server with HMR (Vite)
npm run build     # Type-check (tsc -b) then bundle for production
npm run lint      # Run ESLint across all files
npm run preview   # Serve the production build locally
```

No test runner has been configured yet.

## Architecture

**Entry point:** `index.html` → `src/main.tsx` → `src/App.tsx`

The app uses React 19 with the automatic JSX transform (`react-jsx`). TypeScript targets ES2023. Build output goes to `dist/`.

**Styling:** Per-component CSS files alongside their `.tsx` file. Global tokens and dark-mode support live in `src/index.css` via CSS custom properties. CSS nesting syntax is used (requires modern browser).

**TypeScript:** Strict mode is on — `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all enforced. Two tsconfig files: `tsconfig.app.json` (browser code) and `tsconfig.node.json` (Vite config).

**ESLint:** Flat config (`eslint.config.js`). Type-aware lint rules are not yet enabled — the README notes they should be added before production.

**Branches:** `main` is the production branch; active development happens on `dev`.

## Code Style

- Comments: sparingly — only on code where the logic isn't self-evident.

## Backend

**Location:** `backend/` (NestJS + Prisma + PostgreSQL)

**Commands:**
```bash
cd backend
npm install          # Install dependencies
npm run start:dev    # Development server (port 3000)
npx prisma migrate dev  # Create/run migrations
npx prisma studio   # Interactive database viewer
npm run test         # Run tests
npm run lint         # Lint code
```

**Architecture:** Domain-Driven Design with 7 Bounded Contexts — each in `src/{context}/` with `domain/`, `application/`, `infrastructure/`, `presentation/` layers.

**Database:** PostgreSQL. Run migrations before starting. Prisma schema in `backend/prisma/schema.prisma`.

**Docker:** `docker-compose up` starts postgres, redis, backend, mailhog.

See `backend/README.md` for full setup details.
