// Pure rules for Bridges (Hashiwokakero). Like the other games' logic.ts
// there is no React in here: every function takes data in and returns new
// data out.
//
// Islands sit on a grid, each with a number. Join them with straight
// bridges so every island has exactly that many bridges, and every island
// is linked into one network. Bridges run across or down, at most two
// between a pair, and they can't cross.

import { bankTime, type ClockState } from "@/lib/gameClock";
import { seededRandom } from "@/lib/random";

// A level and a seed fully describe a puzzle.
export { rollSeed } from "@/lib/random";

export const LEVELS = ["easy", "medium", "hard"] as const;
export type Level = (typeof LEVELS)[number];
export const DEFAULT_LEVEL: Level = "easy";

type Rules = { label: string; size: number; islands: number };

export const RULES: Record<Level, Rules> = {
  easy: { label: "Easy", size: 7, islands: 10 },
  medium: { label: "Medium", size: 9, islands: 16 },
  hard: { label: "Hard", size: 11, islands: 24 },
};

export type Island = { r: number; c: number; n: number };

/**
 * A pair of islands that can see each other across or down, with nothing in
 * between. `crosses` lists the edges whose bridges would cut across this one.
 * `max` is 2, or less when an island is too small to take a double bridge.
 */
export type Edge = { a: number; b: number; across: boolean; crosses: number[]; max: number };

export type Puzzle = { size: number; islands: Island[]; edges: Edge[]; solution: number[] };

// ---------- Checking ----------

/** Bridges at each island. */
export function islandCounts(puzzle: Puzzle, bridges: number[]) {
  const counts = Array<number>(puzzle.islands.length).fill(0);
  puzzle.edges.forEach((e, i) => {
    counts[e.a] += bridges[i];
    counts[e.b] += bridges[i];
  });
  return counts;
}

/** How many separate groups the bridges make (1 means everything is linked). */
export function groups(islandCount: number, edges: Edge[], linked: (edge: number) => boolean) {
  const parent = Array.from({ length: islandCount }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  let count = islandCount;
  edges.forEach((e, i) => {
    if (!linked(i)) return;
    const a = find(e.a);
    const b = find(e.b);
    if (a !== b) {
      parent[a] = b;
      count--;
    }
  });
  return count;
}

export function analyze(puzzle: Puzzle, bridges: number[]) {
  const counts = islandCounts(puzzle, bridges);
  const done = puzzle.islands.filter((isl, i) => counts[i] === isl.n).length;
  const linkedGroups = groups(puzzle.islands.length, puzzle.edges, (i) => bridges[i] > 0);
  return { counts, done, groups: linkedGroups, solved: done === puzzle.islands.length && linkedGroups === 1 };
}

/** Bridges already built that a new bridge on this edge would cut across. */
export function blockers(puzzle: Puzzle, bridges: number[], edge: number) {
  return puzzle.edges[edge].crosses.filter((c) => bridges[c] > 0);
}

// ---------- Generating ----------

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

/** Every pair of islands that see each other, and which pairs cross. */
function findEdges(size: number, islands: Island[]): Edge[] {
  const at = new Map(islands.map((isl, i) => [isl.r * size + isl.c, i]));
  const edges: Edge[] = [];
  const cells: number[][] = [];
  islands.forEach((isl, a) => {
    for (const [dr, dc] of [DIRS[0], DIRS[1]]) {
      const path: number[] = [];
      let r = isl.r + dr;
      let c = isl.c + dc;
      while (r < size && c < size && !at.has(r * size + c)) {
        path.push(r * size + c);
        r += dr;
        c += dc;
      }
      const b = at.get(r * size + c);
      if (b === undefined || r >= size || c >= size) continue;
      const max = Math.min(2, isl.n, islands[b].n);
      edges.push({ a, b, across: dr === 0, crosses: [], max });
      cells.push(path);
    }
  });
  // An across edge and a down edge cross when they share a cell.
  edges.forEach((e, i) => {
    const mine = new Set(cells[i]);
    edges.forEach((f, j) => {
      if (e.across !== f.across && cells[j].some((cell) => mine.has(cell))) e.crosses.push(j);
    });
  });
  return edges;
}

/**
 * Grow a network out from one island: pick an island and a direction, walk
 * two or more cells over empty water, and drop a new island there with one
 * or two bridges back. Then add a few extra bridges between islands that
 * already see each other, so the layout isn't just a tree. The numbers come
 * from the bridges, so this answer is always valid.
 */
function layout(rules: Rules, rand: () => number) {
  const { size } = rules;
  const island = new Map<number, number>(); // cell -> island index
  const water = new Set<number>(); // cells a bridge already runs through
  const spots: { r: number; c: number }[] = [];
  const links: { a: number; b: number; count: number }[] = [];
  const free = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < size && c < size && !island.has(r * size + c) && !water.has(r * size + c);
  const crowded = (r: number, c: number) =>
    DIRS.some(([dr, dc]) => island.has((r + dr) * size + (c + dc)) && r + dr >= 0 && c + dc >= 0 && r + dr < size && c + dc < size);

  const place = (r: number, c: number) => {
    island.set(r * size + c, spots.length);
    spots.push({ r, c });
  };
  place(1 + Math.floor(rand() * (size - 2)), 1 + Math.floor(rand() * (size - 2)));

  for (let tries = 0; spots.length < rules.islands && tries < 4000; tries++) {
    const from = Math.floor(rand() * spots.length);
    const [dr, dc] = DIRS[Math.floor(rand() * 4)];
    const length = 2 + Math.floor(rand() * Math.min(4, size - 2));
    const { r, c } = spots[from];
    const tr = r + dr * length;
    const tc = c + dc * length;
    let clear = free(tr, tc) && !crowded(tr, tc);
    for (let k = 1; clear && k < length; k++) clear = free(r + dr * k, c + dc * k);
    if (!clear) continue;
    for (let k = 1; k < length; k++) water.add((r + dr * k) * size + (c + dc * k));
    place(tr, tc);
    links.push({ a: from, b: spots.length - 1, count: rand() < 0.4 ? 2 : 1 });
  }

  // Count bridges per island, then look for extra pairs that could be joined.
  const islands: Island[] = spots.map((s) => ({ ...s, n: 0 }));
  links.forEach((l) => {
    islands[l.a].n += l.count;
    islands[l.b].n += l.count;
  });
  // Edges with n = 0 everywhere would be capped at 0, so use a stand-in n
  // just to find which pairs see each other.
  const seen = findEdges(size, islands.map((i) => ({ ...i, n: 2 })));
  const count = new Map<string, number>();
  links.forEach((l) => count.set(`${Math.min(l.a, l.b)}-${Math.max(l.a, l.b)}`, l.count));
  const used = new Set<number>();
  seen.forEach((e, i) => {
    if (count.has(`${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`)) used.add(i);
  });
  seen.forEach((e, i) => {
    if (used.has(i) || rand() > 0.35) return;
    if (e.crosses.some((j) => used.has(j))) return;
    used.add(i);
    const extra = rand() < 0.3 ? 2 : 1;
    count.set(`${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`, extra);
    islands[e.a].n += extra;
    islands[e.b].n += extra;
  });

  const edges = findEdges(size, islands);
  const solution = edges.map((e) => count.get(`${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`) ?? 0);
  return { size, islands, edges, solution };
}

/**
 * Count the answers, stopping at `limit`. Each edge holds 0 to 2 bridges.
 * Before every guess, squeeze each edge's range using the island numbers
 * (an island showing 4 with two edges needs a double on both) and the
 * crossings, and give up early if the edges still possible can't link
 * everything into one network.
 */
export function countSolutions(puzzle: Puzzle, limit = 2) {
  const { islands, edges } = puzzle;
  const byIsland = islands.map(() => [] as number[]);
  edges.forEach((e, i) => {
    byIsland[e.a].push(i);
    byIsland[e.b].push(i);
  });
  let found = 0;

  const squeeze = (lo: number[], hi: number[]) => {
    for (let changed = true; changed; ) {
      changed = false;
      for (let isl = 0; isl < islands.length; isl++) {
        const mine = byIsland[isl];
        let sumLo = 0;
        let sumHi = 0;
        for (const e of mine) {
          sumLo += lo[e];
          sumHi += hi[e];
        }
        const n = islands[isl].n;
        if (sumLo > n || sumHi < n) return false;
        for (const e of mine) {
          const newLo = Math.max(lo[e], n - (sumHi - hi[e]));
          const newHi = Math.min(hi[e], n - (sumLo - lo[e]));
          if (newLo > newHi) return false;
          if (newLo !== lo[e] || newHi !== hi[e]) {
            lo[e] = newLo;
            hi[e] = newHi;
            changed = true;
          }
        }
      }
      for (let e = 0; e < edges.length; e++) {
        if (lo[e] === 0) continue;
        for (const c of edges[e].crosses) {
          if (lo[c] > 0) return false;
          if (hi[c] > 0) {
            hi[c] = 0;
            changed = true;
          }
        }
      }
    }
    return groups(islands.length, edges, (e) => hi[e] > 0) === 1;
  };

  const search = (lo: number[], hi: number[]) => {
    if (found >= limit || !squeeze(lo, hi)) return;
    const open = lo.findIndex((l, e) => l < hi[e]);
    if (open === -1) {
      if (groups(islands.length, edges, (e) => lo[e] > 0) === 1) found++;
      return;
    }
    for (let v = lo[open]; v <= hi[open]; v++) {
      const nextLo = [...lo];
      const nextHi = [...hi];
      nextLo[open] = nextHi[open] = v;
      search(nextLo, nextHi);
    }
  };

  search(
    edges.map(() => 0),
    edges.map((e) => e.max),
  );
  return found;
}

/** Build layouts until one has exactly one answer. */
export function buildPuzzle(level: Level, seed: number): Puzzle {
  const rules = RULES[level];
  const rand = seededRandom(seed);
  let fallback: Puzzle | null = null;
  for (let attempt = 0; attempt < 300; attempt++) {
    const puzzle = layout(rules, rand);
    if (puzzle.islands.length < rules.islands) continue;
    fallback ??= puzzle;
    if (countSolutions(puzzle) === 1) return puzzle;
  }
  // Never reached in practice, but it keeps the function total. The fallback
  // is still solvable, it just might have a second answer.
  return fallback ?? layout(rules, rand);
}

// ---------- Game state ----------

export type LevelStats = { wins: number; clean: number; fastest: number | null };
export type Stats = Record<Level, LevelStats>;

const zero: LevelStats = { wins: 0, clean: 0, fastest: null };
export const emptyStats: Stats = { easy: zero, medium: zero, hard: zero };

export type Game = ClockState & {
  level: Level;
  seed: number;
  puzzle: Puzzle | null;
  /** Bridges on each edge (0, 1 or 2). */
  bridges: number[];
  /** Edges a hint set. They can't be changed. */
  locked: boolean[];
  solved: boolean;
  newFastest: boolean;
  stats: Stats;
  /** False until the saved game has been read after mount. */
  ready: boolean;
};

export const emptyGame: Game = {
  level: DEFAULT_LEVEL,
  seed: 0,
  puzzle: null,
  bridges: [],
  locked: [],
  solved: false,
  newFastest: false,
  stats: emptyStats,
  elapsed: 0,
  since: null,
  ready: false,
};

function newGame(level: Level, seed: number, stats: Stats): Game {
  const puzzle = buildPuzzle(level, seed);
  const n = puzzle.edges.length;
  return { ...emptyGame, level, seed, stats, puzzle, bridges: Array(n).fill(0), locked: Array(n).fill(false), ready: true };
}

export const hintsUsed = (game: Pick<Game, "locked">) => game.locked.filter(Boolean).length;

/** Apply new bridges: run the clock, and record the win if they solve it. */
function play(state: Game, bridges: number[], locked: boolean[], now: number): Game {
  // The first change starts the clock, and any change after a pause resumes it.
  const clock = { elapsed: state.elapsed, since: state.since ?? now };
  if (!analyze(state.puzzle!, bridges).solved) return { ...state, ...clock, bridges, locked };

  const done = bankTime(clock, now);
  const prev = state.stats[state.level];
  // Only solves without hints count toward the fastest time.
  const clean = !locked.some(Boolean);
  const newFastest = clean && (prev.fastest === null || done.elapsed < prev.fastest);
  return {
    ...state,
    ...done,
    bridges,
    locked,
    solved: true,
    newFastest,
    stats: {
      ...state.stats,
      [state.level]: {
        wins: prev.wins + 1,
        clean: prev.clean + (clean ? 1 : 0),
        fastest: newFastest ? done.elapsed : prev.fastest,
      },
    },
  };
}

export type Action =
  | { type: "cycle"; edge: number; step: 1 | -1; now: number }
  | { type: "hint"; now: number }
  | { type: "reset" }
  | { type: "pause"; now: number }
  | { type: "new"; level: Level; seed: number }
  | { type: "restore"; saved: unknown; stats: Stats; seed: number };

export function reducer(state: Game, action: Action): Game {
  switch (action.type) {
    case "cycle": {
      // 0 → 1 → 2 → 0. Going backwards runs 0 → 2 → 1 → 0.
      if (!state.ready || state.solved || state.locked[action.edge]) return state;
      const puzzle = state.puzzle!;
      if (blockers(puzzle, state.bridges, action.edge).length > 0) return state;
      const { max } = puzzle.edges[action.edge];
      const next = (state.bridges[action.edge] + action.step + max + 1) % (max + 1);
      const bridges = state.bridges.map((b, i) => (i === action.edge ? next : b));
      return play(state, bridges, state.locked, action.now);
    }
    case "hint": {
      if (!state.ready || state.solved) return state;
      const { solution, edges } = state.puzzle!;
      // Prefer a missing or wrong bridge. Only take away a bridge that
      // shouldn't be there once every real bridge is right.
      const wrong = (i: number) => !state.locked[i] && state.bridges[i] !== solution[i];
      let edge = solution.findIndex((s, i) => s > 0 && wrong(i));
      if (edge === -1) edge = solution.findIndex((_, i) => wrong(i));
      if (edge === -1) return state;
      // Bridges in the way are wrong too (the answer has none there), so clear them.
      const bridges = state.bridges.map((b, i) => (i === edge ? solution[i] : edges[edge].crosses.includes(i) ? 0 : b));
      const locked = state.locked.map((l, i) => l || i === edge);
      return play(state, bridges, locked, action.now);
    }
    case "reset":
      if (!state.ready || state.solved) return state;
      return { ...state, bridges: state.bridges.map((b, i) => (state.locked[i] ? b : 0)) };
    case "pause":
      return bankTime(state, action.now);
    case "new":
      return newGame(action.level, action.seed, state.stats);
    case "restore": {
      const saved = parseSaved(action.saved);
      if (!saved) return newGame(DEFAULT_LEVEL, action.seed, action.stats);
      const game = newGame(saved.level, saved.seed, action.stats);
      const { edges } = game.puzzle!;
      const fits =
        saved.bridges.length === edges.length &&
        saved.locked.length === edges.length &&
        saved.bridges.every((b, i) => b <= edges[i].max && (b === 0 || edges[i].crosses.every((c) => saved.bridges[c] === 0)));
      if (!fits) return game;
      return {
        ...game,
        bridges: saved.bridges,
        locked: saved.locked,
        elapsed: saved.elapsed,
        solved: analyze(game.puzzle!, saved.bridges).solved,
      };
    }
  }
}

// ---------- Saving ----------

// The puzzle itself isn't saved. It's rebuilt from the level and seed.
export type SavedGame = Pick<Game, "level" | "seed" | "bridges" | "locked" | "elapsed">;

export function toSaved(game: Game): SavedGame {
  const { level, seed, bridges, locked, elapsed } = game;
  return { level, seed, bridges, locked, elapsed };
}

// localStorage can hold anything, so check the shape before trusting it.
function parseSaved(raw: unknown): SavedGame | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SavedGame>;
  if (!LEVELS.includes(s.level as Level)) return null;
  if (!Number.isInteger(s.seed) || (s.seed as number) < 0) return null;
  if (!Array.isArray(s.bridges) || !s.bridges.every((b) => b === 0 || b === 1 || b === 2)) return null;
  if (!Array.isArray(s.locked) || !s.locked.every((l) => typeof l === "boolean")) return null;
  return {
    level: s.level as Level,
    seed: s.seed as number,
    bridges: s.bridges,
    locked: s.locked,
    elapsed: typeof s.elapsed === "number" && s.elapsed >= 0 ? s.elapsed : 0,
  };
}

/** localStorage can hold anything, so fall back to zeros where it looks wrong. */
export function parseStats(raw: unknown): Stats {
  const all = (raw && typeof raw === "object" ? raw : {}) as Record<string, Partial<LevelStats> | undefined>;
  const positive = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null);
  const stats = { ...emptyStats };
  for (const level of LEVELS) {
    const s = all[level] ?? {};
    const wins = Math.floor(positive(s.wins) ?? 0);
    stats[level] = {
      wins,
      clean: Math.min(wins, Math.floor(positive(s.clean) ?? 0)),
      fastest: positive(s.fastest),
    };
  }
  return stats;
}
