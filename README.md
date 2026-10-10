# Dalin Kim's site

Personal site and blog, built with **Next.js 16 (App Router)**, **Tailwind CSS v4** and **MDX**, exported as static HTML and deployed to GitHub Pages at <https://dalinkim.github.io>.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # static site in out/
```

## Write a post

Add an `.mdx` file to `src/content/posts/`. The file name becomes the URL (`/blog/<file-name>/`).

```mdx
---
title: "My post"
date: "2026-10-09"
description: "One sentence shown in post lists."
tags: ["data engineering"]
---

Markdown here. MDX components are available too:

<Callout variant="tip">Callouts come in `info`, `tip` and `warning`.</Callout>
```

## Edit the resume

Experience and projects on the About page come from `src/data/experience.ts`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `out/` to GitHub Pages.
