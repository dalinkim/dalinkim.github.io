// Pure rules for Pipeline. Like 128's logic.ts there is no React in here:
// every function takes data in and returns new data out.
//
// The board is a grid of pipe tiles. The tiles were cut from one tree that
// reaches every cell from the source, then each tile was spun at random. You
// win when every pipe joins up again, so data from the source reaches every
// cell and no pipe end is left open.

import { bankTime, type ClockState } from "@/lib/gameClock";
import { seededRandom } from "@/lib/random";

// A size and a seed fully describe a puzzle.
export { rollSeed } from "@/lib/random";

export const SIZES = [5, 6, 7] as const;
export type Size = (typeof SIZES)[number];
export const DEFAULT_SIZE: Size = 5;

export const LEVELS: Record<Size, string> = { 5: "Easy", 6: "Medium", 7: "Hard" };

// Each side of a tile is one bit, so a tile's openings fit in a single
// number: 0b0011 is a bend joining north and east.
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const DIRS = [N, E, S, W] as const;

const STEP: Record<number, [number, number]> = { [N]: [-1, 0], [E]: [0, 1], [S]: [1, 0], [W]: [0, -1] };

/** Turn a set of openings clockwise by quarter turns. Negative turns go anticlockwise. */
export function rotateMask(mask: number, turns: number) {
  const t = ((turns % 4) + 4) % 4;
  return ((mask << t) | (mask >> (4 - t))) & 15;
}

export const opposite = (dir: number) => rotateMask(dir, 2);

export function countBits(mask: number) {
  return DIRS.filter((d) => mask & d).length;
}

/**
 * `shape` is the tile's openings in its home orientation. `rot` counts
 * clockwise quarter turns. It keeps counting past 3 so the CSS rotation
 * always spins forward instead of snapping back from 270° to 0°.
 */
export type Cell = { shape: number; rot: number };

export function openings(cell: Cell) {
  return rotateMask(cell.shape, cell.rot);
}

export function neighbor(size: number, index: number, dir: number): number | null {
  const [dr, dc] = STEP[dir];
  const row = Math.floor(index / size) + dr;
  const col = (index % size) + dc;
  if (row < 0 || row >= size || col < 0 || col >= size) return null;
  return row * size + col;
}

export const MAX_ARMS = 3;

/**
 * Grow a random tree out from the source: keep picking a random pipe that
 * leads from the tree into a cell it hasn't reached yet. Capping tiles at
 * three arms rules out the cross piece, which looks the same at every
 * rotation. On a rare unlucky grid the cap can wall a cell off, so this
 * returns null and the caller tries again.
 */
function growTree(size: number, source: number, random: () => number): number[] | null {
  const shapes = new Array<number>(size * size).fill(0);
  const reached = new Array<boolean>(size * size).fill(false);
  reached[source] = true;

  for (let count = 1; count < size * size; count++) {
    const frontier: [number, number][] = [];
    for (let i = 0; i < shapes.length; i++) {
      if (!reached[i] || countBits(shapes[i]) >= MAX_ARMS) continue;
      for (const dir of DIRS) {
        const n = neighbor(size, i, dir);
        if (n !== null && !reached[n]) frontier.push([i, dir]);
      }
    }
    if (frontier.length === 0) return null;

    const [from, dir] = frontier[Math.floor(random() * frontier.length)];
    const to = neighbor(size, from, dir)!;
    shapes[from] |= dir;
    shapes[to] |= opposite(dir);
    reached[to] = true;
  }
  return shapes;
}

export function sourceOf(size: number) {
  const mid = Math.floor(size / 2);
  return mid * size + mid;
}

/** Build a scrambled puzzle. `rot` 0 on every tile is a solution. */
export function buildPuzzle(size: number, seed: number): Cell[] {
  const random = seededRandom(seed);
  const source = sourceOf(size);
  let shapes = growTree(size, source, random);
  while (!shapes) shapes = growTree(size, source, random);

  for (;;) {
    const cells = shapes.map((shape) => ({ shape, rot: Math.floor(random() * 4) }));
    if (!analyze(size, cells).solved) return cells;
  }
}

export type Flow = {
  /** Cells that data from the source currently reaches. */
  lit: boolean[];
  /** The side each lit cell receives data from (0 for the source and for dark cells). */
  from: number[];
  /** Openings on each cell that don't meet a matching opening. */
  leaks: number[];
  tables: number;
  tablesLit: number;
  solved: boolean;
};

/** Follow the data from the source through every joined pipe. */
export function analyze(size: number, cells: Cell[]): Flow {
  const source = sourceOf(size);
  const open = cells.map(openings);
  const leaks = open.map((mask, i) => {
    let leak = 0;
    for (const dir of DIRS) {
      if (!(mask & dir)) continue;
      const n = neighbor(size, i, dir);
      if (n === null || !(open[n] & opposite(dir))) leak |= dir;
    }
    return leak;
  });

  const lit = new Array<boolean>(cells.length).fill(false);
  const from = new Array<number>(cells.length).fill(0);
  lit[source] = true;
  const queue = [source];
  // A breadth-first search: visit the source, then everything one pipe
  // away, then two pipes away, and so on.
  while (queue.length) {
    const i = queue.shift()!;
    for (const dir of DIRS) {
      if (!(open[i] & dir) || leaks[i] & dir) continue;
      const n = neighbor(size, i, dir)!;
      if (lit[n]) continue;
      lit[n] = true;
      from[n] = opposite(dir);
      queue.push(n);
    }
  }

  let tables = 0;
  let tablesLit = 0;
  cells.forEach((cell, i) => {
    if (i === source || countBits(cell.shape) !== 1) return;
    tables++;
    if (lit[i]) tablesLit++;
  });

  return {
    lit,
    from,
    leaks,
    tables,
    tablesLit,
    solved: lit.every(Boolean) && leaks.every((l) => l === 0),
  };
}

/** Lifetime numbers for one board size in this browser. */
export type SizeStats = {
  wins: number;
  /** Shortest solve, in milliseconds. */
  fastest: number | null;
  fewest: number | null;
};

export type Stats = Record<Size, SizeStats>;

const noStats: SizeStats = { wins: 0, fastest: null, fewest: null };
export const emptyStats: Stats = { 5: noStats, 6: noStats, 7: noStats };

export type Game = ClockState & {
  size: Size;
  /** Identifies the puzzle. The board remounts when it changes, so no tile spins between puzzles. */
  seed: number;
  cells: Cell[];
  moves: number;
  solved: boolean;
  newFastest: boolean;
  stats: Stats;
  ready: boolean;
};

export const emptyGame: Game = {
  size: DEFAULT_SIZE,
  seed: 0,
  cells: [],
  moves: 0,
  solved: false,
  newFastest: false,
  stats: emptyStats,
  elapsed: 0,
  since: null,
  ready: false,
};

function newGame(size: Size, seed: number, stats: Stats): Game {
  return { ...emptyGame, size, seed, stats, cells: buildPuzzle(size, seed), ready: true };
}

export type Action =
  | { type: "rotate"; index: number; turns: 1 | -1; now: number }
  | { type: "pause"; now: number }
  | { type: "new"; size: Size; seed: number }
  | { type: "restore"; saved: unknown; stats: Stats; seed: number };

export function reducer(state: Game, action: Action): Game {
  switch (action.type) {
    case "rotate": {
      if (!state.ready || state.solved) return state;
      const cells = state.cells.map((c, i) => (i === action.index ? { ...c, rot: c.rot + action.turns } : c));
      const moves = state.moves + 1;
      // The first turn starts the clock, and any turn after a pause resumes it.
      const clock = { elapsed: state.elapsed, since: state.since ?? action.now };
      if (!analyze(state.size, cells).solved) return { ...state, ...clock, cells, moves };

      const done = bankTime(clock, action.now);
      const prev = state.stats[state.size];
      const newFastest = prev.fastest === null || done.elapsed < prev.fastest;
      return {
        ...state,
        ...done,
        cells,
        moves,
        solved: true,
        newFastest,
        stats: {
          ...state.stats,
          [state.size]: {
            wins: prev.wins + 1,
            fastest: newFastest ? done.elapsed : prev.fastest,
            fewest: Math.min(prev.fewest ?? Infinity, moves),
          },
        },
      };
    }
    case "pause":
      return bankTime(state, action.now);
    case "new":
      return newGame(action.size, action.seed, state.stats);
    case "restore": {
      const saved = parseSaved(action.saved);
      if (!saved) return newGame(DEFAULT_SIZE, action.seed, action.stats);
      return {
        ...emptyGame,
        ...saved,
        seed: action.seed,
        stats: action.stats,
        solved: analyze(saved.size, saved.cells).solved,
        ready: true,
      };
    }
  }
}

export type SavedGame = Pick<Game, "size" | "cells" | "moves" | "elapsed">;

export function toSaved(game: Game): SavedGame {
  return {
    size: game.size,
    cells: game.cells.map(({ shape, rot }) => ({ shape, rot: ((rot % 4) + 4) % 4 })),
    moves: game.moves,
    elapsed: game.elapsed,
  };
}

// localStorage can hold anything, so check the shape before trusting it.
function parseSaved(raw: unknown): SavedGame | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SavedGame>;
  if (!SIZES.includes(s.size as Size) || !Array.isArray(s.cells)) return null;
  const size = s.size as Size;
  if (s.cells.length !== size * size) return null;
  const valid = s.cells.every(
    (c) =>
      Number.isInteger(c?.shape) &&
      Number.isInteger(c?.rot) &&
      c.shape > 0 &&
      c.shape < 16 &&
      countBits(c.shape) <= MAX_ARMS,
  );
  // A tree over n cells has n - 1 pipes, and each pipe has two ends.
  const ends = s.cells.reduce((sum, c) => sum + countBits(c?.shape ?? 0), 0);
  if (!valid || ends !== 2 * (size * size - 1)) return null;
  return {
    size,
    cells: s.cells.map(({ shape, rot }) => ({ shape, rot: ((rot % 4) + 4) % 4 })),
    moves: typeof s.moves === "number" && s.moves >= 0 ? Math.floor(s.moves) : 0,
    elapsed: typeof s.elapsed === "number" && s.elapsed >= 0 ? s.elapsed : 0,
  };
}

/** localStorage can hold anything, so fall back to zeros where it looks wrong. */
export function parseStats(raw: unknown): Stats {
  const all = (raw && typeof raw === "object" ? raw : {}) as Record<string, Partial<SizeStats> | undefined>;
  const positive = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null);
  const stats = { ...emptyStats };
  for (const size of SIZES) {
    const s = all[size] ?? {};
    const fewest = positive(s.fewest);
    stats[size] = {
      wins: Math.floor(positive(s.wins) ?? 0),
      fastest: positive(s.fastest),
      fewest: fewest === null ? null : Math.floor(fewest),
    };
  }
  return stats;
}
