// Pure game rules for 1024. No React in here, which keeps the rules easy to
// reason about: every function takes data in and returns new data out.

export const SIZE = 4;
export const GOAL = 1024;
export const LADDER = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

export type Direction = "up" | "down" | "left" | "right";

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  // Decides the entrance animation. A tile only animates when it first mounts.
  kind: "start" | "new" | "merged";
  // A tile that slid into a merge. It stays rendered under the merged tile
  // until the next move so the slide animation can finish.
  ghost?: boolean;
};

export type Game = {
  tiles: Tile[];
  score: number;
  best: number;
  moves: number;
  nextId: number;
  won: boolean;
  keepPlaying: boolean;
  lastGain: number;
  undo: { tiles: Tile[]; score: number; moves: number; won: boolean } | null;
  ready: boolean;
};

/** Random numbers are rolled outside the reducer so the reducer stays pure. */
export type Rolls = number[];

export function rollDice(count = 4): Rolls {
  return Array.from({ length: count }, () => Math.random());
}

export const emptyGame: Game = {
  tiles: [],
  score: 0,
  best: 0,
  moves: 0,
  nextId: 1,
  won: false,
  keepPlaying: false,
  lastGain: 0,
  undo: null,
  ready: false,
};

export function liveTiles(tiles: Tile[]) {
  return tiles.filter((t) => !t.ghost);
}

export function maxTile(tiles: Tile[]) {
  return liveTiles(tiles).reduce((max, t) => Math.max(max, t.value), 0);
}

function spawn(tiles: Tile[], nextId: number, cellRoll: number, valueRoll: number) {
  const taken = new Set(liveTiles(tiles).map((t) => t.row * SIZE + t.col));
  const empty: number[] = [];
  for (let i = 0; i < SIZE * SIZE; i++) if (!taken.has(i)) empty.push(i);
  if (empty.length === 0) return { tiles, nextId };

  const cell = empty[Math.floor(cellRoll * empty.length)];
  const tile: Tile = {
    id: nextId,
    value: valueRoll < 0.9 ? 2 : 4,
    row: Math.floor(cell / SIZE),
    col: cell % SIZE,
    kind: "new",
  };
  return { tiles: [...tiles, tile], nextId: nextId + 1 };
}

export function newGame(best: number, rolls: Rolls): Game {
  let next = spawn([], 1, rolls[0], rolls[1]);
  next = spawn(next.tiles, next.nextId, rolls[2], rolls[3]);
  return { ...emptyGame, tiles: next.tiles, nextId: next.nextId, best, ready: true };
}

/** The cells of one row or column, ordered from the edge the tiles slide toward. */
function lineCells(dir: Direction, line: number): [number, number][] {
  const order = [...Array(SIZE).keys()];
  if (dir === "right" || dir === "down") order.reverse();
  return order.map((i) => (dir === "left" || dir === "right" ? [line, i] : [i, line]));
}

export function slide(tiles: Tile[], dir: Direction, nextId: number) {
  const byCell = new Map(liveTiles(tiles).map((t) => [t.row * SIZE + t.col, t]));
  const out: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let line = 0; line < SIZE; line++) {
    const cells = lineCells(dir, line);
    let slot = 0;
    // The last tile placed in this line, if it can still absorb a merge.
    let last: Tile | null = null;

    for (const [row, col] of cells) {
      const tile = byCell.get(row * SIZE + col);
      if (!tile) continue;

      if (last && last.value === tile.value) {
        // Both tiles slide into the same cell and a new, doubled tile pops in.
        const [r, c] = cells[slot - 1];
        last.ghost = true;
        out.push({ ...tile, row: r, col: c, ghost: true });
        out.push({ id: nextId++, value: tile.value * 2, row: r, col: c, kind: "merged" });
        gained += tile.value * 2;
        moved = true;
        last = null;
      } else {
        const [r, c] = cells[slot++];
        const placed: Tile = { ...tile, row: r, col: c };
        if (r !== tile.row || c !== tile.col) moved = true;
        out.push(placed);
        last = placed;
      }
    }
  }

  return { tiles: out, gained, moved, nextId };
}

export function canMove(tiles: Tile[]) {
  const live = liveTiles(tiles);
  if (live.length < SIZE * SIZE) return true;
  const grid = new Map(live.map((t) => [t.row * SIZE + t.col, t.value]));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid.get(r * SIZE + c);
      if (c + 1 < SIZE && grid.get(r * SIZE + c + 1) === v) return true;
      if (r + 1 < SIZE && grid.get((r + 1) * SIZE + c) === v) return true;
    }
  }
  return false;
}

export type Action =
  | { type: "move"; dir: Direction; rolls: Rolls }
  | { type: "new"; rolls: Rolls }
  | { type: "undo" }
  | { type: "keepPlaying" }
  | { type: "restore"; saved: unknown; best: number; rolls: Rolls };

export function reducer(state: Game, action: Action): Game {
  switch (action.type) {
    case "move": {
      if (!state.ready || (state.won && !state.keepPlaying)) return state;
      const result = slide(state.tiles, action.dir, state.nextId);
      if (!result.moved) return state;

      const spawned = spawn(result.tiles, result.nextId, action.rolls[0], action.rolls[1]);
      const score = state.score + result.gained;
      return {
        ...state,
        tiles: spawned.tiles,
        nextId: spawned.nextId,
        score,
        best: Math.max(state.best, score),
        moves: state.moves + 1,
        won: state.won || maxTile(spawned.tiles) >= GOAL,
        lastGain: result.gained,
        undo: {
          tiles: liveTiles(state.tiles).map((t) => ({ ...t, kind: "start" })),
          score: state.score,
          moves: state.moves,
          won: state.won,
        },
      };
    }
    case "undo": {
      if (!state.undo) return state;
      return { ...state, ...state.undo, lastGain: 0, undo: null };
    }
    case "new":
      return newGame(state.best, action.rolls);
    case "keepPlaying":
      return { ...state, keepPlaying: true };
    case "restore": {
      const saved = parseSaved(action.saved);
      if (!saved) return newGame(action.best, action.rolls);
      // Fresh ids, and "new" so the restored board fades in.
      const tiles = saved.tiles.map((t, i) => ({ ...t, id: i + 1, kind: "new" as const }));
      return {
        ...emptyGame,
        ...saved,
        tiles,
        nextId: tiles.length + 1,
        best: Math.max(action.best, saved.score),
        ready: true,
      };
    }
  }
}

export type SavedGame = Pick<Game, "score" | "moves" | "won" | "keepPlaying"> & {
  tiles: Pick<Tile, "value" | "row" | "col">[];
};

export function toSaved(game: Game): SavedGame {
  return {
    tiles: liveTiles(game.tiles).map(({ value, row, col }) => ({ value, row, col })),
    score: game.score,
    moves: game.moves,
    won: game.won,
    keepPlaying: game.keepPlaying,
  };
}

// localStorage can hold anything, so check the shape before trusting it.
function parseSaved(raw: unknown): SavedGame | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<SavedGame>;
  if (!Array.isArray(s.tiles) || s.tiles.length === 0 || typeof s.score !== "number") return null;
  const valid = s.tiles.every(
    (t) =>
      Number.isInteger(t?.value) &&
      Number.isInteger(t?.row) &&
      Number.isInteger(t?.col) &&
      t.row >= 0 && t.row < SIZE && t.col >= 0 && t.col < SIZE,
  );
  if (!valid || !canMove(s.tiles.map((t, i) => ({ ...t, id: i, kind: "start" })))) return null;
  return {
    tiles: s.tiles,
    score: s.score,
    moves: typeof s.moves === "number" ? s.moves : 0,
    won: Boolean(s.won),
    keepPlaying: Boolean(s.keepPlaying),
  };
}
