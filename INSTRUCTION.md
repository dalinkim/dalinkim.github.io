# Project History & Instructions

This document tracks the development journey of Dalin's personal website. It serves as a context recovery file for the AI assistant.

## Project Goal
Build a modern, premium personal website using **Next.js**. The site will feature a "plugin-like" modular architecture to allow easy addition of future "products".
**Educational Focus**: The development process will be documented and explained to help the user (a new frontend developer) learn modern web development concepts.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (Premium aesthetics)
- **Deployment**: GitHub Pages (implied by repo name `dalinkim.github.io`)

## Development Log

### Phase 1: Inception & Reset
*Date: 2025-12-28*
- Analyzed existing HTML5 UP template.
- Decision made to **restart from scratch** to use modern tools.
- Selected Next.js for its modularity and performance.
- User requested this `INSTRUCTION.md` to maintain historical context.

### Phase 2: Initialization (Completed)
- Cleaned up existing files.
- Initialized `create-next-app` with **Tailwind CSS**, TypeScript, and App Router.
- Restored `INSTRUCTION.md` after initialization.

### Phase 3: Core Architecture (Completed)
- Implemented "plugin-like" structure (`/app/products/`).
- Set up premium design system with simple, clean styling.
- Created core pages: Home, About, Blog, Products, Resources.
- Generated `README.md` for documentation.

### Phase 4: Refocus (Completed)
- **Pivot**: User requested to focus only on "About Me" and remove other sections initially.
- Used `read_url_content` to retrieve public LinkedIn data.
- Updated `src/app/page.tsx` to be the single-page profile/resume.
- Removed unused routes and simplified `Header.tsx`.

### Phase 5: Data Refactoring & Grouping (Current)
- Externalized experience data into `src/data/experience.ts`.
- Refactored data structure and UI to group multiple roles under a single company header.
- Handled nested mapping in `src/app/page.tsx`.

### Phase 6: Redesign & Blog (2026-10-09)
- Fresh visual design in the spirit of joshwcomeau.com (original code): warm palette, bold display headings, light/dark toggle, callouts.
- Added an MDX blog (`src/content/posts/`). Ported the "Fundamentals of Data Engineering" post from the old Jekyll `refresh` branch and added two placeholder posts. The Jekyll sample posts (apples, kiwifruit) were not carried over.
- New pages: Home (hero + recent posts), Blog index, Post, About (resume + "Things I like" photos from the HTML5 UP site), 404.
- Switched to static export and a GitHub Actions Pages deploy (`.github/workflows/deploy.yml`), developed on the `redesign` branch.
