// Pure rules for Mobiles. Like the other games' logic.ts there is no React
// in here: every function takes data in and returns new data out.
//
// A mobile is a tree. Each bar hangs from its middle and has two equal arms,
// so it only balances when both sides weigh the same. The leaves are strings
// of shapes, and every shape of one kind weighs the same whole number. You
// know the whole mobile's weight. Find each shape's weight.
//
// Under the hood every bar is an equation (left side = right side) and the
// total is one more. A level with k shapes always has at least k equations,
// and the generator only keeps puzzles whose equations pin down exactly one
// answer, so a guess that balances everything is the answer.

import { bankTime, type ClockState } from "@/lib/gameClock";
import { seededRandom } from "@/lib/random";

// A level and a seed fully describe a puzzle.
export { rollSeed } from "@/lib/random";

export const LEVELS = ["easy", "medium", "hard"] as const;
export type Level = (typeof LEVELS)[number];
export const DEFAULT_LEVEL: Level = "easy";

type Rules = {
  label: string;
  /** How many kinds of shape (unknowns). */
  shapes: number;
  /** How many bars (equations, plus one for the total). */
  bars: number;
  /** Heaviest a shape can be. */
  maxWeight: number;
  /** Most shapes on one string. */
  maxStack: number;
  /** Most bars between the ceiling and a string. */
  maxDepth: number;
};

export const RULES: Record<Level, Rules> = {
  easy: { label: "Easy", shapes: 2, bars: 1, maxWeight: 9, maxStack: 3, maxDepth: 1 },
  medium: { label: "Medium", shapes: 3, bars: 2, maxWeight: 9, maxStack: 3, maxDepth: 2 },
  hard: { label: "Hard", shapes: 4, bars: 3, maxWeight: 12, maxStack: 3, maxDepth: 3 },
};

/** Highest number a guess box accepts. */
export const MAX_GUESS = 99;

/** A string of shapes (shape indexes, sorted) or a bar with two sides. */
export type Mobile = { kind: "stack"; items: number[] } | { kind: "bar"; left: Mobile; right: Mobile };

export type Puzzle = { mobile: Mobile; weights: number[]; total: number };

export type Guesses = (number | null)[];

// ---------- Weighing ----------

/** A node's weight using the given shape weights, or null if any shape in it has no weight yet. */
export function weigh(node: Mobile, weights: Guesses): number | null {
  if (node.kind === "stack") {
    let sum = 0;
    for (const item of node.items) {
      const w = weights[item];
      if (w === null || w === undefined) return null;
      sum += w;
    }
    return sum;
  }
  const left = weigh(node.left, weights);
  const right = weigh(node.right, weights);
  return left === null || right === null ? null : left + right;
}

/** How many bars there are, and how many hang level with these weights. */
export function countBalanced(node: Mobile, weights: Guesses): { bars: number; balanced: number } {
  if (node.kind === "stack") return { bars: 0, balanced: 0 };
  const l = countBalanced(node.left, weights);
  const r = countBalanced(node.right, weights);
  const left = weigh(node.left, weights);
  const level = left !== null && left === weigh(node.right, weights);
  return { bars: l.bars + r.bars + 1, balanced: l.balanced + r.balanced + (level ? 1 : 0) };
}

export function isSolved(puzzle: Puzzle, guesses: Guesses) {
  if (guesses.some((g) => g === null)) return false;
  const { bars, balanced } = countBalanced(puzzle.mobile, guesses);
  return bars === balanced && weigh(puzzle.mobile, guesses) === puzzle.total;
}

// ---------- Generating ----------

/** The bars with empty strings, grown at random. `depth` counts bars above this node. */
function skeleton(bars: number, depth: number, maxDepth: number, rand: () => number): Mobile {
  if (bars === 0) return { kind: "stack", items: [] };
  // A side one level down can hold at most 2^(levels left) - 1 bars.
  const cap = 2 ** (maxDepth - depth - 1) - 1;
  const rest = bars - 1;
  const lo = Math.max(0, rest - cap);
  const hi = Math.min(rest, cap);
  const left = lo + Math.floor(rand() * (hi - lo + 1));
  return {
    kind: "bar",
    left: skeleton(left, depth + 1, maxDepth, rand),
    right: skeleton(rest - left, depth + 1, maxDepth, rand),
  };
}

/** Every string of 1 to maxStack shapes, grouped by its weight. */
function stacksByWeight(weights: number[], maxStack: number) {
  const byWeight = new Map<number, number[][]>();
  const grow = (items: number[], from: number, sum: number) => {
    if (items.length > 0) byWeight.set(sum, [...(byWeight.get(sum) ?? []), items]);
    if (items.length === maxStack) return;
    for (let s = from; s < weights.length; s++) grow([...items, s], s, sum + weights[s]);
  };
  grow([], 0, 0);
  return byWeight;
}

/** Each string's depth (how many bars hang above it), in tree order. */
function stackDepths(node: Mobile, depth = 1): number[] {
  return node.kind === "stack" ? [depth - 1] : [...stackDepths(node.left, depth + 1), ...stackDepths(node.right, depth + 1)];
}

/** Fill the strings in tree order. A string at depth d carries total / 2^d. */
function fill(node: Mobile, total: number, pick: (weight: number) => number[]): Mobile {
  if (node.kind === "stack") return { kind: "stack", items: pick(total) };
  return { kind: "bar", left: fill(node.left, total / 2, pick), right: fill(node.right, total / 2, pick) };
}

function shapeCounts(node: Mobile, k: number): number[] {
  const counts = Array<number>(k).fill(0);
  const walk = (n: Mobile) => {
    if (n.kind === "stack") n.items.forEach((s) => counts[s]++);
    else {
      walk(n.left);
      walk(n.right);
    }
  };
  walk(node);
  return counts;
}

/** One equation per bar (left counts minus right counts = 0). */
function barRows(node: Mobile, k: number): number[][] {
  if (node.kind === "stack") return [];
  const left = shapeCounts(node.left, k);
  const right = shapeCounts(node.right, k);
  return [left.map((c, i) => c - right[i]), ...barRows(node.left, k), ...barRows(node.right, k)];
}

/** Rank of a small matrix by Gaussian elimination. */
function rank(rows: number[][]) {
  const m = rows.map((r) => [...r]);
  const cols = m[0]?.length ?? 0;
  let r = 0;
  for (let c = 0; c < cols && r < m.length; c++) {
    const p = m.findIndex((row, i) => i >= r && Math.abs(row[c]) > 1e-9);
    if (p === -1) continue;
    [m[r], m[p]] = [m[p], m[r]];
    for (let i = 0; i < m.length; i++) {
      if (i === r) continue;
      const f = m[i][c] / m[r][c];
      for (let j = c; j < cols; j++) m[i][j] -= f * m[r][j];
    }
    r++;
  }
  return r;
}

/** Two strings hanging from the same bar must differ, or that bar tells you nothing. */
function siblingsDiffer(node: Mobile): boolean {
  if (node.kind === "stack") return true;
  const { left, right } = node;
  if (left.kind === "stack" && right.kind === "stack" && left.items.join() === right.items.join()) return false;
  return siblingsDiffer(left) && siblingsDiffer(right);
}

/**
 * Build a puzzle backwards from its answer: pick the weights, grow the bars,
 * pick a total that splits evenly all the way down, then hang a string of the
 * right weight on every end. Keep it only if every shape is used and the
 * equations have exactly one solution.
 */
export function buildPuzzle(level: Level, seed: number): Puzzle {
  const rules = RULES[level];
  const rand = seededRandom(seed);
  const pickFrom = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

  let fallback: Puzzle | null = null;
  for (let attempt = 0; attempt < 5000; attempt++) {
    // Distinct weights, in shuffled order, so shape 0 isn't always the lightest.
    const pool = Array.from({ length: rules.maxWeight }, (_, i) => i + 1);
    const weights: number[] = [];
    while (weights.length < rules.shapes) weights.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);

    const bare = skeleton(rules.bars, 0, rules.maxDepth, rand);
    const depths = stackDepths(bare);
    const deepest = 2 ** Math.max(...depths);
    const byWeight = stacksByWeight(weights, rules.maxStack);
    const ceiling = deepest * rules.maxStack * rules.maxWeight;

    const totals: number[] = [];
    for (let t = deepest; t <= ceiling; t += deepest) {
      if (depths.every((d) => byWeight.has(t / 2 ** d))) totals.push(t);
    }
    if (totals.length === 0) continue;

    const total = pickFrom(totals);
    const mobile = fill(bare, total, (w) => pickFrom(byWeight.get(w)!));
    if (!siblingsDiffer(mobile)) continue;
    const counts = shapeCounts(mobile, rules.shapes);
    if (counts.some((c) => c === 0)) continue;
    const puzzle = { mobile, weights, total };
    fallback ??= puzzle;
    if (rank([...barRows(mobile, rules.shapes), counts]) === rules.shapes) return puzzle;
  }
  // Never reached in practice (a few dozen tries at most), but it keeps the
  // function total.
  return fallback!;
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
  guesses: Guesses;
  /** Shapes whose weight a hint gave away. Their boxes are locked. */
  revealed: boolean[];
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
  guesses: [],
  revealed: [],
  solved: false,
  newFastest: false,
  stats: emptyStats,
  elapsed: 0,
  since: null,
  ready: false,
};

function newGame(level: Level, seed: number, stats: Stats): Game {
  const puzzle = buildPuzzle(level, seed);
  const k = puzzle.weights.length;
  return {
    ...emptyGame,
    level,
    seed,
    stats,
    puzzle,
    guesses: Array(k).fill(null),
    revealed: Array(k).fill(false),
    ready: true,
  };
}

export const hintsUsed = (game: Pick<Game, "revealed">) => game.revealed.filter(Boolean).length;

/** Apply new guesses: run the clock, and record the win if they solve it. */
function play(state: Game, guesses: Guesses, revealed: boolean[], now: number): Game {
  // The first change starts the clock, and any change after a pause resumes it.
  const clock = { elapsed: state.elapsed, since: state.since ?? now };
  if (!isSolved(state.puzzle!, guesses)) return { ...state, ...clock, guesses, revealed };

  const done = bankTime(clock, now);
  const prev = state.stats[state.level];
  // Only solves without hints count toward the fastest time.
  const clean = !revealed.some(Boolean);
  const newFastest = clean && (prev.fastest === null || done.elapsed < prev.fastest);
  return {
    ...state,
    ...done,
    guesses,
    revealed,
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
  | { type: "guess"; index: number; value: number | null; now: number }
  | { type: "hint"; now: number }
  | { type: "clear" }
  | { type: "pause"; now: number }
  | { type: "new"; level: Level; seed: number }
  | { type: "restore"; saved: unknown; stats: Stats; seed: number };

export function reducer(state: Game, action: Action): Game {
  switch (action.type) {
    case "guess": {
      if (!state.ready || state.solved || state.revealed[action.index]) return state;
      if (state.guesses[action.index] === action.value) return state;
      const guesses = state.guesses.map((g, i) => (i === action.index ? action.value : g));
      return play(state, guesses, state.revealed, action.now);
    }
    case "hint": {
      if (!state.ready || state.solved) return state;
      const { weights } = state.puzzle!;
      // Give away a shape the player has wrong (or blank), so a hint is never wasted.
      const index = weights.findIndex((w, i) => !state.revealed[i] && state.guesses[i] !== w);
      if (index === -1) return state;
      const guesses = state.guesses.map((g, i) => (i === index ? weights[i] : g));
      const revealed = state.revealed.map((r, i) => r || i === index);
      return play(state, guesses, revealed, action.now);
    }
    case "clear":
      if (!state.ready || state.solved) return state;
      return { ...state, guesses: state.guesses.map((g, i) => (state.revealed[i] ? g : null)) };
    case "pause":
      return bankTime(state, action.now);
    case "new":
      return newGame(action.level, action.seed, state.stats);
    case "restore": {
      const saved = parseSaved(action.saved);
      if (!saved) return newGame(DEFAULT_LEVEL, action.seed, action.stats);
      const game = newGame(saved.level, saved.seed, action.stats);
      const k = game.guesses.length;
      if (saved.guesses.length !== k || saved.revealed.length !== k) return game;
      return {
        ...game,
        guesses: saved.guesses,
        revealed: saved.revealed,
        elapsed: saved.elapsed,
        solved: isSolved(game.puzzle!, saved.guesses),
      };
    }
  }
}

// ---------- Saving ----------

// The puzzle itself isn't saved. It's rebuilt from the level and seed.
export type SavedGame = Pick<Game, "level" | "seed" | "guesses" | "revealed" | "elapsed">;

export function toSaved(game: Game): SavedGame {
  const { level, seed, guesses, revealed, elapsed } = game;
  return { level, seed, guesses, revealed, elapsed };
}

const isGuess = (g: unknown) => g === null || (Number.isInteger(g) && (g as number) >= 1 && (g as number) <= MAX_GUESS);

// localStorage can hold anything, so check the shape before trusting it.
function parseSaved(raw: unknown): SavedGame | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SavedGame>;
  if (!LEVELS.includes(s.level as Level)) return null;
  if (!Number.isInteger(s.seed) || (s.seed as number) < 0) return null;
  if (!Array.isArray(s.guesses) || !s.guesses.every(isGuess)) return null;
  if (!Array.isArray(s.revealed) || !s.revealed.every((r) => typeof r === "boolean")) return null;
  return {
    level: s.level as Level,
    seed: s.seed as number,
    guesses: s.guesses,
    revealed: s.revealed,
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
