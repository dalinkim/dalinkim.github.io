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

### Phase 7: Databricks GenAI study guide series (2026-10-10)
- Turned the user's Databricks Certified Generative AI Engineer Associate study notes (a 103-page PDF of course slides plus notes, certification earned June 2025) into a three-part blog series dated late June 2025: `databricks-genai-engineer-part-1-rag-foundations`, `-part-2-building-apps` and `-part-3-evaluate-deploy-operate`.
- Slide screenshots were not reused. Every diagram is a React component in `src/components/diagrams/`:
  - `primitives.tsx`: generic `Figure`, `Flow`/`Step`, `Lanes`/`Lane` and `Cards`/`Card`, usable straight from MDX with string props and Markdown children.
  - `retrieval.tsx`, `systems.tsx`, `operations.tsx`: one-off diagrams for Parts 1, 2 and 3 (inline SVG or Tailwind layouts).
  - `index.ts` exports `diagramComponents`, which `blog/[slug]/page.tsx` spreads into the MDX `components` map.
- All diagram colours use the theme tokens (`fill-primary`, `bg-secondary-soft`, `stroke-line`…), so they follow light/dark mode. Step rows stack vertically below the `sm` breakpoint.

### Phase 8: 1024 game (2026-10-10)
- Added `/play/`, a 2048-style game that ends at 1024. It runs entirely in the browser, so it works on the static export.
- `src/components/game1024/`:
  - `logic.ts`: pure rules (`slide`, `canMove`, `reducer`). Random numbers are rolled outside the reducer (`rollDice`) and passed in through actions, so the reducer stays pure.
  - `Game1024.tsx`: the client component. It uses `useReducer` for state, `useEffectEvent` for the global keyboard listener (arrows, WASD, U to undo, N for a new game), pointer events for swipes, and the Web Animations API for the "nudge" on a blocked move. The game and best score are saved to `localStorage` after mount, so the first client render still matches the server HTML. The page passes its static sidebar cards in as `children`.
  - `TileFace.tsx` + `game1024.css`: the tile palette (warm → cool → gold at 1024) via `data-value`, sliding via CSS transitions on `--col`/`--row`, delayed appear/pop keyframes, and confetti. Board sizes use container query units (`cqw`).
  - `PlayTeaser.tsx`: the home-page card.
- Entry points: the header "Play" link (icon only below `sm`), the home teaser, the footer and the 404 page.
