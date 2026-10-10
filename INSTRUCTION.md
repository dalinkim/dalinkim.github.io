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

### Phase 9: 1024 becomes 128, plus a completion record (2026-10-10)
- The goal dropped from 1024 to 128 (`GOAL` in `logic.ts`) for a shorter game. Everything was renamed to match: `src/components/game128/` (`Game128.tsx`, `game128.css`), the title tiles, metadata and the header, footer, 404 and home links. The tile palette was compressed to 7 steps (cream → apricot → coral → pink → violet → gold at 128), and anything past 128 uses the "super" tile.
- Lifetime stats for each browser are saved in `localStorage` under `game128:stats` (`best`, `wins`, `fewest`). The game in progress is under `game128:save`, so old 1024 saves are ignored. A per-game `winCounted` flag (saved with the game, but not in the undo snapshot) makes sure undoing and re-merging the 128 tile, or reloading a won game, never counts twice.
- New "Your record" sidebar card: the completion count, a shelf with one gold tile per completion (12 shown, then "+N"), the fewest moves to 128 and the best score. The win screen shows "Completion #N in this browser".

### Phase 10: 128 timer and fastest time (2026-10-10)
- Added a game clock. `elapsed` is banked ms and `since` is when the current running stretch began. The live time is `clockAt(game, now)`. The clock starts on the first move, stops on the first win (`winCounted`) or a full board, and pauses when the tab is hidden or the page closes (`visibilitychange` / `pagehide`). It resumes on the next move. Undo doesn't rewind it.
- Purity: the reducer never reads the clock. The time is passed in with each action (`move.now`, `pause.now`), the same way `rolls` are. `Date.now()` is only called in event handlers and effects. The `react-hooks/purity` lint rule enforces this.
- The `pagehide` handler writes the save to `localStorage` itself, because a closing page may never run the save effect.
- The `Clock` component holds its own `now` state, refreshed every 100ms only while the clock runs, so the ticking re-renders only that card.
- `Stats` gained `fastest` (ms). The record card shows Fastest, Fewest moves and Best score. The win screen shows the run's time and a "New fastest time" badge. The top stat row is now Score, Moves and Time.

### Phase 11: Pipeline game and the /play/ arcade (2026-10-10)
- `/play/` is now a page listing the games. 128 moved to `/play/128/` and the new game is at `/play/pipeline/`. The header, footer and 404 links say "Play" instead of "Play 128". The home teaser (`src/components/PlayTeaser.tsx`) links to `/play/` and fans out a preview of each game.
- **Pipeline** (`src/components/pipeline/`): every tile is part of a pipe network that has been scrambled. Turn tiles until data from the source (centre) reaches every table (dead end) with no open pipe ends. Sizes are 5×5 Easy, 6×6 Medium and 7×7 Hard.
  - `logic.ts`: a tile's openings are a 4-bit mask (N=1, E=2, S=4, W=8), and turning a tile rotates the bits. Puzzles are a random spanning tree grown out from the source (at most 3 arms per tile, so there is no cross piece), then each tile is spun at random. Generation uses a seeded RNG (`seededRandom`, mulberry32), so a size and a seed fully describe a puzzle. That's the hook for a future daily puzzle: use the date as the seed. `analyze()` does a breadth-first search from the source to find lit cells, the side each lit cell is fed from, leaks (open ends with nothing to join) and the solved state. It runs on every render rather than being stored.
  - `PipeTile.tsx`: one tile's SVG. Arms are drawn in the tile's home orientation, and CSS rotates the whole SVG by `--rot` quarter turns. `rot` keeps counting past 3 so every turn animates forward. Each arm's path runs the way data flows, so the dashed "flow dots" move away from the source. The source and table icons sit on top and don't rotate.
  - `PipelineGame.tsx`: the same patterns as 128 (`useReducer`, restore after mount, `pagehide` save, the clock passed in through actions). The grid uses a roving tabindex, so arrow keys move focus and Enter turns. Right-click or Shift-click turns a tile back. Per-size stats (`wins`, `fastest`, `fewest`) are saved under `pipeline:stats`, and the game in progress under `pipeline:save`.
  - `PipelinePreview.tsx`: a solved board generated at build time from a fixed seed, for the arcade cards.
- The clock helpers (`bankTime`, `clockAt`, `formatTime`) moved to `src/lib/gameClock.ts` so both games share them. `game128/logic.ts` re-exports them. The 128 board preview moved to `game128/BoardPreview.tsx`.
