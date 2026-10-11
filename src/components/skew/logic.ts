// Pure rules for Skew. Like the other games' logic.ts there is no React in
// here: every function takes data in and returns new data out.
//
// A puzzle is a list of task sizes (seconds of work) and a number of
// workers. A worker's load is the sum of its tasks, and the stage finishes
// when the busiest worker does. Par is the best possible stage time, found
// by the solver below. Placing every task with a stage time equal to par
// wins.

import { bankTime, type ClockState } from "@/lib/gameClock";
import { seededRandom } from "@/lib/random";

export type Level = "balanced" | "skewed" | "salted";
export const LEVEL_ORDER: Level[] = ["balanced", "skewed", "salted"];

export const LEVELS: Record<Level, { name: string; blurb: string; workers: number; salts: number }> = {
  balanced: { name: "Balanced", blurb: "A perfect split exists.", workers: 3, salts: 0 },
  skewed: { name: "Skewed", blurb: "One partition is huge.", workers: 4, salts: 0 },
  salted: { name: "Salted", blurb: "Salt big tasks to split them.", workers: 3, salts: 2 },
};

/**
 * Salting splits a task in two, like adding a random salt to a hot key so
 * its rows spread over two partitions. Each half carries this much extra
 * work: the cost of the extra shuffle.
 */
export const SALT_COST = 1;
export const MIN_SALT_SIZE = 4;

export function saltHalves(size: number): [number, number] {
  return [Math.ceil(size / 2) + SALT_COST, Math.floor(size / 2) + SALT_COST];
}

/** One colour per puzzle task. Salted halves share their parent's. */
export const HUES = [30, 340, 200, 265, 14, 174, 48, 290, 110, 225, 0, 150];

export type Task = {
  id: number;
  size: number;
  /** Index into the puzzle. It picks the colour, and salted halves keep their parent's. */
  origin: number;
  /** Which worker runs it, or null while it waits in the queue. */
  worker: number | null;
  salted: boolean;
};

export function canSalt(task: Task, saltsLeft: number) {
  return saltsLeft > 0 && !task.salted && task.size >= MIN_SALT_SIZE;
}

export function loadsOf(tasks: Task[], workers: number) {
  const loads = new Array<number>(workers).fill(0);
  for (const t of tasks) if (t.worker !== null) loads[t.worker] += t.size;
  return loads;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ---------- Solver ----------

/**
 * The best way to split `sizes` across `workers`, or null if nothing beats
 * `cap`. It's a depth-first search that tries every task on every worker,
 * biggest tasks first, with three shortcuts that keep it fast:
 * - skip a branch once its busiest worker is already no better than the best found
 * - two workers with the same load are interchangeable, so only try one
 * - stop as soon as a split reaches the lower bound, since nothing can beat it
 */
export function bestSplit(sizes: number[], workers: number, cap = Infinity) {
  const order = sizes.map((_, i) => i).sort((a, b) => sizes[b] - sizes[a]);
  const floor = Math.max(Math.ceil(sum(sizes) / workers), ...sizes);
  const load = new Array<number>(workers).fill(0);
  const assign = new Array<number>(sizes.length).fill(-1);
  let best = cap;
  let bestAssign: number[] | null = null;

  function place(k: number, worst: number) {
    if (best <= floor) return;
    if (k === order.length) {
      best = worst;
      bestAssign = [...assign];
      return;
    }
    const i = order[k];
    const tried = new Set<number>();
    for (let w = 0; w < workers; w++) {
      const next = load[w] + sizes[i];
      if (next >= best || tried.has(load[w])) continue;
      tried.add(load[w]);
      load[w] = next;
      assign[i] = w;
      place(k + 1, Math.max(worst, next));
      load[w] -= sizes[i];
    }
  }

  place(0, 0);
  return bestAssign ? { stage: best, assignment: bestAssign as number[] } : null;
}

/** What the queue-sorting shortcut gets: biggest task first, onto the least busy worker. */
export function greedyStage(sizes: number[], workers: number) {
  const load = new Array<number>(workers).fill(0);
  for (const size of [...sizes].sort((a, b) => b - a)) {
    load[load.indexOf(Math.min(...load))] += size;
  }
  return Math.max(...load);
}

export type Plan = { stage: number; tasks: Task[] };

/** Every way to choose up to `count` items from `items`, including none. */
function choices(items: number[], count: number): number[][] {
  if (count === 0 || items.length === 0) return [[]];
  const [first, ...rest] = items;
  return [...choices(rest, count - 1).map((c) => [first, ...c]), ...choices(rest, count)];
}

/** Build a placed task list from a puzzle, the tasks to salt and the worker for each piece. */
function piecesOf(puzzle: number[], salted: number[]) {
  return puzzle.flatMap((size, origin) =>
    salted.includes(origin) ? saltHalves(size).map((s) => ({ size: s, origin, salted: true })) : [{ size, origin, salted: false }],
  );
}

/** Par: the best stage time over every allowed choice of tasks to salt. */
export function solve(puzzle: number[], level: Level): Plan {
  const { workers, salts } = LEVELS[level];
  const saltable = puzzle.flatMap((size, i) => (size >= MIN_SALT_SIZE ? [i] : []));
  let best: Plan | null = null;
  for (const salted of choices(saltable, salts)) {
    const pieces = piecesOf(puzzle, salted);
    const split = bestSplit(
      pieces.map((p) => p.size),
      workers,
      best?.stage ?? Infinity,
    );
    if (!split) continue;
    best = {
      stage: split.stage,
      tasks: pieces.map((p, i) => ({ ...p, id: i + 1, worker: split.assignment[i] })),
    };
  }
  return best!;
}

// ---------- Puzzle generation ----------

/** Cut `total` into `count` random parts, each at least `min`. */
function cut(total: number, count: number, min: number, random: () => number): number[] {
  for (;;) {
    const cuts = Array.from({ length: count - 1 }, () => min + Math.floor(random() * (total - 2 * min + 1))).sort((a, b) => a - b);
    const parts = [...cuts, total].map((c, i) => c - (i === 0 ? 0 : cuts[i - 1]));
    if (parts.every((p) => p >= min)) return parts;
  }
}

function shuffle<T>(items: T[], random: () => number) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const between = (lo: number, hi: number, random: () => number) => lo + Math.floor(random() * (hi - lo + 1));

// Puzzles are built backwards from a known good split, so par is easy to
// hit in principle. The harder levels then throw away any puzzle that the
// biggest-first shortcut already solves, so you have to think.
function draft(level: Level, random: () => number): number[] {
  switch (level) {
    case "balanced": {
      const target = between(12, 16, random);
      return [0, 1, 2].flatMap(() => cut(target, random() < 0.6 ? 3 : 2, 2, random));
    }
    case "skewed": {
      const giant = between(13, 17, random);
      return [giant, ...[0, 1, 2].flatMap(() => cut(giant, random() < 0.6 ? 3 : 2, 2, random))];
    }
    case "salted": {
      const giant = between(20, 26, random);
      const big = between(11, 16, random);
      return [giant, big, ...Array.from({ length: 5 }, () => between(2, 6, random))];
    }
  }
}

export function generate(level: Level, seed: number): { puzzle: number[]; par: number } {
  const random = seededRandom(seed);
  const { workers } = LEVELS[level];
  let fallback: { puzzle: number[]; par: number } | null = null;

  for (let attempt = 0; attempt < 40; attempt++) {
    const puzzle = shuffle(draft(level, random), random);
    const par = solve(puzzle, level).stage;
    fallback ??= { puzzle, par };
    if (level === "balanced") return { puzzle, par };
    if (level === "salted") {
      // Salting has to matter: the best split without salt must be worse.
      if (bestSplit(puzzle, workers)!.stage > par) return { puzzle, par };
    } else if (greedyStage(puzzle, workers) > par) {
      return { puzzle, par };
    }
  }
  return fallback!;
}

// ---------- Game state ----------

export type LevelStats = {
  wins: number;
  /** Shortest solve, in milliseconds. */
  fastest: number | null;
  fewest: number | null;
};

export type Stats = Record<Level, LevelStats>;

const noStats: LevelStats = { wins: 0, fastest: null, fewest: null };
export const emptyStats: Stats = { balanced: noStats, skewed: noStats, salted: noStats };

export type Status = "playing" | "solved" | "revealed";

export type Game = ClockState & {
  level: Level;
  /** Identifies the puzzle on screen. */
  seed: number;
  puzzle: number[];
  par: number;
  tasks: Task[];
  nextId: number;
  saltsLeft: number;
  moves: number;
  status: Status;
  newFastest: boolean;
  stats: Stats;
  ready: boolean;
};

export const emptyGame: Game = {
  level: "balanced",
  seed: 0,
  puzzle: [],
  par: 0,
  tasks: [],
  nextId: 1,
  saltsLeft: 0,
  moves: 0,
  status: "playing",
  newFastest: false,
  stats: emptyStats,
  elapsed: 0,
  since: null,
  ready: false,
};

function freshTasks(puzzle: number[]): Task[] {
  return puzzle.map((size, i) => ({ id: i + 1, size, origin: i, worker: null, salted: false }));
}

function newGame(level: Level, seed: number, stats: Stats): Game {
  const { puzzle, par } = generate(level, seed);
  return {
    ...emptyGame,
    level,
    seed,
    puzzle,
    par,
    tasks: freshTasks(puzzle),
    nextId: puzzle.length + 1,
    saltsLeft: LEVELS[level].salts,
    stats,
    ready: true,
  };
}

/** Apply a turn's new tasks, start the clock, and check for a win. */
function afterTurn(state: Game, tasks: Task[], now: number, extra: Partial<Game> = {}): Game {
  const moves = state.moves + 1;
  // The first turn starts the clock, and any turn after a pause resumes it.
  const clock = { elapsed: state.elapsed, since: state.since ?? now };
  const placed = tasks.every((t) => t.worker !== null);
  const stage = Math.max(...loadsOf(tasks, LEVELS[state.level].workers));
  if (!placed || stage > state.par) return { ...state, ...extra, ...clock, tasks, moves };

  const done = bankTime(clock, now);
  const prev = state.stats[state.level];
  const newFastest = prev.fastest === null || done.elapsed < prev.fastest;
  return {
    ...state,
    ...extra,
    ...done,
    tasks,
    moves,
    status: "solved",
    newFastest,
    stats: {
      ...state.stats,
      [state.level]: {
        wins: prev.wins + 1,
        fastest: newFastest ? done.elapsed : prev.fastest,
        fewest: Math.min(prev.fewest ?? Infinity, moves),
      },
    },
  };
}

export type Action =
  | { type: "move"; id: number; worker: number | null; now: number }
  | { type: "salt"; id: number; now: number }
  | { type: "reset" }
  | { type: "reveal"; now: number }
  | { type: "pause"; now: number }
  | { type: "new"; level: Level; seed: number }
  | { type: "restore"; saved: unknown; stats: Stats; seed: number };

export function reducer(state: Game, action: Action): Game {
  switch (action.type) {
    case "move": {
      if (!state.ready || state.status !== "playing") return state;
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task || task.worker === action.worker) return state;
      // Moved to the end, so a lane shows its tasks in the order they arrived.
      const tasks = [...state.tasks.filter((t) => t.id !== action.id), { ...task, worker: action.worker }];
      return afterTurn(state, tasks, action.now);
    }
    case "salt": {
      if (!state.ready || state.status !== "playing") return state;
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task || !canSalt(task, state.saltsLeft)) return state;
      const [a, b] = saltHalves(task.size);
      const halves: Task[] = [
        { ...task, id: state.nextId, size: a, salted: true },
        { ...task, id: state.nextId + 1, size: b, salted: true },
      ];
      const tasks = state.tasks.flatMap((t) => (t.id === task.id ? halves : [t]));
      return afterTurn(state, tasks, action.now, { saltsLeft: state.saltsLeft - 1, nextId: state.nextId + 2 });
    }
    case "reset": {
      if (!state.ready || state.status !== "playing") return state;
      return {
        ...state,
        tasks: freshTasks(state.puzzle),
        nextId: state.puzzle.length + 1,
        saltsLeft: LEVELS[state.level].salts,
      };
    }
    case "reveal": {
      if (!state.ready || state.status !== "playing") return state;
      const plan = solve(state.puzzle, state.level);
      return {
        ...bankTime(state, action.now),
        tasks: plan.tasks,
        nextId: plan.tasks.length + 1,
        saltsLeft: LEVELS[state.level].salts - new Set(plan.tasks.filter((t) => t.salted).map((t) => t.origin)).size,
        status: "revealed",
      };
    }
    case "pause":
      return bankTime(state, action.now);
    case "new":
      return newGame(action.level, action.seed, state.stats);
    case "restore": {
      const saved = parseSaved(action.saved);
      if (!saved) return newGame("balanced", action.seed, action.stats);
      return {
        ...emptyGame,
        ...saved,
        seed: action.seed,
        par: solve(saved.puzzle, saved.level).stage,
        nextId: Math.max(0, ...saved.tasks.map((t) => t.id)) + 1,
        stats: action.stats,
        ready: true,
      };
    }
  }
}

// ---------- Saving ----------

export type SavedGame = Pick<Game, "level" | "puzzle" | "tasks" | "saltsLeft" | "moves" | "elapsed" | "status">;

export function toSaved(game: Game): SavedGame {
  const { level, puzzle, tasks, saltsLeft, moves, elapsed, status } = game;
  return { level, puzzle, tasks, saltsLeft, moves, elapsed, status };
}

// localStorage can hold anything, so check the shape before trusting it.
function parseSaved(raw: unknown): SavedGame | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SavedGame>;
  if (!s.level || !LEVEL_ORDER.includes(s.level)) return null;
  const level = s.level;
  const { workers, salts } = LEVELS[level];
  const puzzle = s.puzzle;
  if (!Array.isArray(puzzle) || puzzle.length < 4 || puzzle.length > 12) return null;
  if (!puzzle.every((n) => Number.isInteger(n) && n > 0 && n <= 40)) return null;
  if (!Array.isArray(s.tasks)) return null;

  const tasks = s.tasks;
  const ids = new Set<number>();
  for (const t of tasks) {
    if (!t || !Number.isInteger(t.id) || ids.has(t.id) || !Number.isInteger(t.origin) || !puzzle[t.origin]) return null;
    if (t.worker !== null && !(Number.isInteger(t.worker) && t.worker >= 0 && t.worker < workers)) return null;
    ids.add(t.id);
  }
  // Every puzzle task must be there once, either whole or as two salted halves.
  let saltsUsed = 0;
  for (let origin = 0; origin < puzzle.length; origin++) {
    const mine = tasks.filter((t) => t.origin === origin);
    const whole = mine.length === 1 && !mine[0].salted && mine[0].size === puzzle[origin];
    const halves = saltHalves(puzzle[origin]);
    const salted =
      mine.length === 2 &&
      mine.every((t) => t.salted) &&
      [...mine.map((t) => t.size)].sort().join() === [...halves].sort().join();
    if (salted) saltsUsed++;
    else if (!whole) return null;
  }
  if (saltsUsed > salts) return null;

  const status: Status = s.status === "solved" || s.status === "revealed" ? s.status : "playing";
  return {
    level,
    puzzle,
    tasks: tasks.map(({ id, size, origin, worker, salted }) => ({ id, size, origin, worker, salted: Boolean(salted) })),
    saltsLeft: salts - saltsUsed,
    moves: typeof s.moves === "number" && s.moves >= 0 ? Math.floor(s.moves) : 0,
    elapsed: typeof s.elapsed === "number" && s.elapsed >= 0 ? s.elapsed : 0,
    status,
  };
}

/** localStorage can hold anything, so fall back to zeros where it looks wrong. */
export function parseStats(raw: unknown): Stats {
  const all = (raw && typeof raw === "object" ? raw : {}) as Record<string, Partial<LevelStats> | undefined>;
  const positive = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null);
  const stats = { ...emptyStats };
  for (const level of LEVEL_ORDER) {
    const s = all[level] ?? {};
    const fewest = positive(s.fewest);
    stats[level] = {
      wins: Math.floor(positive(s.wins) ?? 0),
      fastest: positive(s.fastest),
      fewest: fewest === null ? null : Math.floor(fewest),
    };
  }
  return stats;
}
