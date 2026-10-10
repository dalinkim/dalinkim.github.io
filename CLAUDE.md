# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dalin Kim's personal site and blog. It's a Next.js rebuild that replaced an HTML5 UP static template, and the visual direction is a warm, playful, reading-focused blog. `INSTRUCTION.md` is a running development log that serves as AI context recovery. Read it for history, and append a new phase entry when you make significant changes. The user is new to frontend development and asked for the process to be educational, so explain the Next.js, React or Tailwind concepts behind any non-trivial change.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # static export to out/ (also type-checks)
npm run lint    # ESLint 9 flat config (next core-web-vitals + typescript)
```

There is no test framework. To check the production output, serve `out/` with any static server (for example `python3 -m http.server -d out`).

## Stack

- Next.js 16 (App Router), React 19 and TypeScript (strict). The `@/*` path alias maps to `src/*`.
- **Static export only.** `next.config.ts` sets `output: "export"`, `trailingSlash: true` and `images.unoptimized`. Nothing can rely on a server: no route handlers, middleware, ISR or runtime `params`. Dynamic routes need `generateStaticParams` and `dynamicParams = false`.
- Tailwind CSS v4 through `@tailwindcss/postcss`. There is no `tailwind.config.*`.
- Fonts come from `next/font/google` in `layout.tsx`: Bricolage Grotesque for headings, Figtree for body text and JetBrains Mono for code.

## Architecture

- **Theming:** colours are CSS variables in `src/app/globals.css`. `:root` holds light mode, `[data-theme="dark"]` holds dark mode, and `@theme inline` exposes them as Tailwind colours (`bg-bg`, `text-ink`, `text-primary`, `bg-surface-muted` and so on). Use these tokens rather than raw Tailwind palette colours. The `dark:` variant is keyed to `data-theme`. An inline script in `layout.tsx` sets `data-theme` before first paint, and `ThemeToggle` writes it and saves it to `localStorage`.
- **Blog:** posts are `src/content/posts/<slug>.mdx` with front matter (`title`, `date`, `description`, `tags`). `src/lib/posts.ts` reads them with `gray-matter` at build time. `src/app/blog/[slug]/page.tsx` renders them with `next-mdx-remote/rsc` (`remark-gfm`, `rehype-slug`). Components available inside MDX are registered in that page's `components` prop (currently `Callout`). Article typography is the hand-written `.prose` block in `globals.css`. There is no typography plugin.
- **About page:** the resume content (experience grouped by company, projects, education, skills and certifications) lives in `src/data/experience.ts`. Edit the data, not the JSX.

## Deployment

`.github/workflows/deploy.yml` builds the site and deploys `out/` with the GitHub Pages Actions flow (the Pages source must be set to "GitHub Actions"). It runs on pushes to `main`, plus `redesign` while the redesign was under review. Internal links must keep their trailing slash (`/blog/`) to match the export.
