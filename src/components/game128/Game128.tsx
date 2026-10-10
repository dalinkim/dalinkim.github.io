"use client";

import { useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import TileFace from "./TileFace";
import {
  GOAL,
  LADDER,
  bankTime,
  canMove,
  clockAt,
  emptyGame,
  formatTime,
  maxTile,
  reducer,
  rollDice,
  slide,
  toSaved,
  type Direction,
  type Stats,
} from "./logic";

const SAVE_KEY = "game128:save";
const STATS_KEY = "game128:stats";

const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const NUDGE: Record<Direction, [number, number]> = {
  up: [0, -6],
  down: [0, 6],
  left: [-6, 0],
  right: [6, 0],
};

export default function Game128({ children }: { children?: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyGame);
  const boardRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const over = state.ready && !canMove(state.tiles);
  const showWin = state.won && !state.keepPlaying;
  const top = maxTile(state.tiles);

  // Load the saved game after mount. The server-rendered HTML has an empty
  // board, so the first client render must match it before we fill it in.
  useEffect(() => {
    let saved: unknown = null;
    let stats: Stats = { best: 0, wins: 0, fewest: null, fastest: null };
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      stats = parseStats(JSON.parse(localStorage.getItem(STATS_KEY) ?? "null"));
    } catch {}
    dispatch({ type: "restore", saved, stats, rolls: rollDice() });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      // Effects may read the clock, unlike the reducer. Bank the running
      // stretch so a crash or reload keeps the time up to now.
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSaved(bankTime(state, Date.now()))));
      const stats: Stats = { best: state.best, wins: state.wins, fewest: state.fewest, fastest: state.fastest };
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {}
  }, [state]);

  // `now` comes from the event handler that triggered the move, so this
  // function never reads the clock itself.
  function move(dir: Direction, now: number) {
    if (!state.ready || showWin || over) return;
    if (!slide(state.tiles, dir, 0).moved) {
      nudge(dir);
      return;
    }
    dispatch({ type: "move", dir, rolls: rollDice(2), now });
  }

  // A small bump in the direction you tried, so a blocked move still feels physical.
  function nudge(dir: Direction) {
    const el = boardRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [x, y] = NUDGE[dir];
    el.animate(
      [{ transform: "none" }, { transform: `translate(${x}px, ${y}px)` }, { transform: "none" }],
      { duration: 160, easing: "ease-out" },
    );
  }

  function restart() {
    dispatch({ type: "new", rolls: rollDice() });
  }

  // useEffectEvent always sees the latest state, so the listener below can
  // be attached once instead of being re-added after every move.
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const dir = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
    if (dir) {
      e.preventDefault();
      move(dir, Date.now());
    } else if (e.key === "u" || e.key === "U") {
      dispatch({ type: "undo" });
    } else if (e.key === "n" || e.key === "N") {
      restart();
    }
  });

  // Pause the clock when the tab is hidden or the page is closing. It
  // resumes on the next move. The save is written right here because a
  // closing page may never get to run the effect above.
  const onHide = useEffectEvent(() => {
    if (!state.ready) return;
    const now = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSaved(bankTime(state, now))));
    } catch {}
    dispatch({ type: "pause", now });
  });

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    const onPageHide = () => onHide();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function onPointerUp(e: React.PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    const now = Date.now();
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left", now);
    else move(dy > 0 ? "down" : "up", now);
  }

  // Render in id order so existing tiles never change DOM position, which
  // would interrupt their CSS transitions.
  const tiles = [...state.tiles].sort((a, b) => a.id - b.id);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,30rem)_1fr] md:items-start lg:gap-12">
      <div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Score" value={state.score.toLocaleString()}>
            {state.lastGain > 0 && (
              <span key={state.moves} className="score-float font-display text-base font-extrabold text-primary">
                +{state.lastGain}
              </span>
            )}
          </Stat>
          <Stat label="Moves" value={state.moves.toLocaleString()} />
          <Clock
            elapsed={state.elapsed}
            since={state.since}
            paused={state.since === null && state.elapsed > 0 && !state.winCounted && !over}
          />
        </div>

        <div className="board-wrap">
          <div
            ref={boardRef}
            className="board"
            role="group"
            aria-label="128 board. Use the arrow keys or swipe to slide the tiles."
            onPointerDown={(e) => (swipeStart.current = { x: e.clientX, y: e.clientY })}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
          >
            <div className="board-cells" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="board-cell" />
              ))}
            </div>

            <div className="board-tiles" aria-hidden="true">
              {tiles.map((t) => (
                <div
                  key={t.id}
                  className="tile"
                  style={
                    {
                      "--col": t.col,
                      "--row": t.row,
                      zIndex: t.ghost ? 1 : t.kind === "merged" ? 3 : 2,
                    } as React.CSSProperties
                  }
                >
                  <TileFace value={t.value} kind={t.kind} />
                </div>
              ))}
            </div>

            {showWin && (
              <Overlay>
                <Confetti />
                <TileFace
                  value={GOAL}
                  className="relative mx-auto h-24 w-24 rotate-[-6deg] rounded-2xl text-3xl [--tile-depth:5px]"
                />
                <p className="relative mt-5 font-display text-3xl font-extrabold tracking-tight">You hit 2⁷!</p>
                <p className="relative mt-1 text-base text-ink-muted">
                  {state.score.toLocaleString()} points, {state.moves} moves,{" "}
                  <span className="font-semibold text-ink">{formatTime(state.elapsed)}</span>
                </p>
                <div className="relative mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                    {state.wins === 1 ? "Your first completion" : `Completion #${state.wins}`}
                  </span>
                  {state.newFastest && state.wins > 1 && (
                    <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-secondary">
                      ⚡ New fastest time
                    </span>
                  )}
                </div>
                <div className="relative mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" autoFocus onClick={() => dispatch({ type: "keepPlaying" })} className={primaryButton}>
                    Keep going
                  </button>
                  <button type="button" onClick={restart} className={ghostButton}>
                    New game
                  </button>
                </div>
              </Overlay>
            )}

            {over && (
              <Overlay>
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary">Board full</p>
                <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">Out of moves</p>
                <p className="mt-1 text-base text-ink-muted">
                  Top tile {top} · {state.score.toLocaleString()} points
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" autoFocus onClick={restart} className={primaryButton}>
                    Try again
                  </button>
                  {state.undo && (
                    <button type="button" onClick={() => dispatch({ type: "undo" })} className={ghostButton}>
                      Undo last move
                    </button>
                  )}
                </div>
              </Overlay>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={restart} className={primaryButton}>
            <RestartIcon />
            New game
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "undo" })}
            disabled={!state.undo}
            className={`${ghostButton} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <UndoIcon />
            Undo
          </button>
          <p className="ml-auto text-sm text-ink-muted max-sm:w-full max-sm:text-center">
            Your game saves automatically.
          </p>
        </div>

        <p className="sr-only" aria-live="polite">
          {showWin
            ? `You reached ${GOAL}! Score ${state.score}.`
            : over
              ? `No moves left. Final score ${state.score}.`
              : ""}
        </p>
      </div>

      <aside className="space-y-5">
        <Ladder max={top} />
        <Record wins={state.wins} fewest={state.fewest} fastest={state.fastest} best={state.best} />
        {children}
      </aside>
    </div>
  );
}

const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-bg shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-0";
const ghostButton =
  "inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-5 py-2 text-base font-bold transition-colors hover:border-ink";

function Stat({ label, value, children }: { label: React.ReactNode; value: string; children?: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow)]">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold tabular-nums tracking-tight">{value}</p>
      {children}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="overlay-in absolute inset-0 z-10 grid place-items-center overflow-hidden rounded-[4.5cqw] bg-bg/75 p-6 text-center backdrop-blur-sm">
      <div>{children}</div>
    </div>
  );
}

function Ladder({ max }: { max: number }) {
  const reached = LADDER.filter((v) => max >= v).length;
  const next = LADDER.find((v) => v > max);

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Tile ladder</h2>
        <p className="text-sm font-semibold text-ink-muted">
          {next ? (
            <>
              Next up: <span className="text-ink">{next}</span>
            </>
          ) : (
            <span className="text-primary">Summit reached ✦</span>
          )}
        </p>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {LADDER.map((v) => {
          const lit = max >= v;
          return (
            <li key={`${v}-${lit}`}>
              {lit ? (
                <TileFace
                  value={v}
                  kind="merged"
                  className={`aspect-square rounded-lg text-[0.8rem] [--tile-depth:3px] ${
                    v === max || (v === GOAL && max > GOAL) ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                  }`}
                />
              ) : (
                <div className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-line font-display text-[0.8rem] font-extrabold text-ink-muted/60">
                  {v}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,hsl(30_95%_66%),hsl(340_78%_54%),hsl(265_72%_58%),hsl(42_100%_55%))] transition-[width] duration-500"
          style={{ width: `${(reached / LADDER.length) * 100}%` }}
        />
      </div>
    </section>
  );
}

/**
 * The live timer. It owns its own "now", refreshed 10 times a second only
 * while the clock runs, so the ticking re-renders this card and nothing else.
 */
function Clock({ elapsed, since, paused }: { elapsed: number; since: number | null; paused: boolean }) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (since === null) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [since]);

  const label = (
    <>
      Time
      {since !== null && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />}
      {paused && (
        <span title="Paused. Resumes on your next move." className="flex gap-[2px]">
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="sr-only">paused</span>
        </span>
      )}
    </>
  );
  return <Stat label={label} value={formatTime(clockAt({ elapsed, since }, now))} />;
}

const SHELF = 12;

/** Lifetime stats for this browser: one gold tile on the shelf per completed game. */
function Record({ wins, fewest, fastest, best }: Stats) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your record</h2>
        <p className="text-sm text-ink-muted">Saved in this browser</p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <p className="font-display text-5xl font-extrabold tabular-nums tracking-tight">{wins}</p>
        <p className="text-base leading-snug text-ink-muted">
          {wins === 1 ? "game" : "games"} completed
          <br />
          {wins === 0 ? "Reach 128 to earn your first gold tile." : "Each gold tile is one run to 128."}
        </p>
      </div>

      <ul aria-hidden="true" className="mt-4 flex flex-wrap gap-1.5">
        {Array.from({ length: Math.max(1, Math.min(wins, SHELF)) }, (_, i) =>
          i < wins ? (
            <li key={i}>
              <TileFace
                value={GOAL}
                className="h-8 w-8 rounded-md text-[0.6rem] [--tile-depth:2px]"
                style={{ rotate: `${((i * 7) % 11) - 5}deg` }}
              />
            </li>
          ) : (
            <li key={i} className="h-8 w-8 rounded-md border-2 border-dashed border-line" />
          ),
        )}
        {wins > SHELF && (
          <li className="grid h-8 place-items-center px-1 text-sm font-bold text-ink-muted">+{wins - SHELF}</li>
        )}
      </ul>

      <dl className="mt-4 grid grid-cols-3 items-end gap-3 border-t border-dashed border-line pt-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Fastest</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums text-secondary">
            {fastest === null ? "—" : formatTime(fastest)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Fewest moves</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums">{fewest ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Best score</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums">{best.toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  );
}

// localStorage can hold anything, so fall back to zeros if it looks wrong.
function parseStats(raw: unknown): Stats {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Stats>;
  const count = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
  return {
    best: count(s.best),
    wins: count(s.wins),
    fewest: typeof s.fewest === "number" && s.fewest > 0 ? Math.floor(s.fewest) : null,
    fastest: typeof s.fastest === "number" && s.fastest > 0 ? s.fastest : null,
  };
}

// Deterministic "random" pieces: the same on every render, so nothing jumps.
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  x: `${(i * 37) % 100}%`,
  hue: [12, 40, 174, 262, 340, 210][i % 6],
  delay: `${((i * 53) % 100) / 70}s`,
  dur: `${1.8 + ((i * 29) % 10) / 8}s`,
  rot: `${(i * 67) % 360}deg`,
}));

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti"
          style={
            { "--x": c.x, "--hue": c.hue, "--delay": c.delay, "--dur": c.dur, "--rot": c.rot } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function RestartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

