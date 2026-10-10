"use client";

import { useEffect, useEffectEvent, useMemo, useReducer, useRef, useState } from "react";
import { bankTime, clockAt, formatTime } from "@/lib/gameClock";
import PipeTile, { tileKind, type TileKind } from "./PipeTile";
import {
  DEFAULT_SIZE,
  DIRS,
  E,
  LEVELS,
  N,
  S,
  SIZES,
  W,
  analyze,
  emptyGame,
  openings,
  parseStats,
  reducer,
  rollSeed,
  toSaved,
  type Cell,
  type Size,
  type Stats,
} from "./logic";

const SAVE_KEY = "pipeline:save";
const STATS_KEY = "pipeline:stats";

const SIDE_NAMES: Record<number, string> = { [N]: "up", [E]: "right", [S]: "down", [W]: "left" };

export default function PipelineGame({ children }: { children?: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyGame);
  const [focus, setFocus] = useState(0);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Derived from the cells on every render instead of being stored, so it
  // can never drift out of sync with the board. useMemo skips the work when
  // only the clock or the focus changed.
  const flow = useMemo(() => analyze(state.size, state.cells), [state.size, state.cells]);
  const size = state.ready ? state.size : DEFAULT_SIZE;
  const stats = state.stats[state.size];

  // Load the saved game after mount. The server-rendered HTML has an empty
  // board, so the first client render must match it before we fill it in.
  useEffect(() => {
    let saved: unknown = null;
    let stats: Stats | undefined;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      stats = parseStats(JSON.parse(localStorage.getItem(STATS_KEY) ?? "null"));
    } catch {}
    dispatch({ type: "restore", saved, stats: stats ?? parseStats(null), seed: rollSeed() });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSaved(bankTime(state, Date.now()))));
      localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
    } catch {}
  }, [state]);

  // Pause the clock when the tab is hidden or the page is closing. It
  // resumes on the next turn. The save is written here too, because a
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

  function rotate(index: number, turns: 1 | -1) {
    dispatch({ type: "rotate", index, turns, now: Date.now() });
  }

  function newPuzzle(next: Size = state.size) {
    dispatch({ type: "new", size: next, seed: rollSeed() });
    setFocus(0);
  }

  // Roving focus: only one tile is in the tab order, and the arrow keys move
  // focus around the grid. Tab then jumps past the board in one press.
  function onGridKeyDown(e: React.KeyboardEvent) {
    const row = Math.floor(focus / size);
    const col = focus % size;
    const next: Record<string, number> = {
      ArrowUp: row > 0 ? focus - size : focus,
      ArrowDown: row < size - 1 ? focus + size : focus,
      ArrowLeft: col > 0 ? focus - 1 : focus,
      ArrowRight: col < size - 1 ? focus + 1 : focus,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    setFocus(next[e.key]);
    tileRefs.current[next[e.key]]?.focus();
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,30rem)_1fr] md:items-start lg:gap-12">
      <div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Tables" value={state.ready ? `${flow.tablesLit}/${flow.tables}` : "–"} />
          <Stat label="Turns" value={state.moves.toLocaleString()} />
          <Clock elapsed={state.elapsed} since={state.since} paused={state.since === null && state.elapsed > 0 && !state.solved} />
        </div>

        <div className="pipe-board-wrap">
          <div className="pipe-board" data-solved={state.solved}>
            <div
              key={state.seed}
              className="pipe-grid"
              role="grid"
              aria-label={`Pipeline board, ${size} by ${size}. Use the arrow keys to move and Enter to turn a tile.`}
              style={{ "--size": size } as React.CSSProperties}
              onKeyDown={onGridKeyDown}
            >
              {state.ready
                ? Array.from({ length: size }, (_, r) => (
                    <div key={r} role="row" className="contents">
                      {state.cells.slice(r * size, r * size + size).map((cell, c) => {
                        const i = r * size + c;
                        const kind = tileKind(size, i, cell);
                        return (
                          <button
                            key={i}
                            ref={(el) => {
                              tileRefs.current[i] = el;
                            }}
                            type="button"
                            role="gridcell"
                            className="pipe-cell"
                            tabIndex={i === focus ? 0 : -1}
                            disabled={state.solved}
                            aria-label={`Row ${r + 1}, column ${c + 1}. ${describe(kind, cell, flow.lit[i], flow.leaks[i])}`}
                            onFocus={() => setFocus(i)}
                            onClick={(e) => rotate(i, e.shiftKey ? -1 : 1)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              rotate(i, -1);
                            }}
                          >
                            <PipeTile cell={cell} kind={kind} lit={flow.lit[i]} from={flow.from[i]} leaks={flow.leaks[i]} />
                          </button>
                        );
                      })}
                    </div>
                  ))
                : Array.from({ length: size * size }, (_, i) => <div key={i} className="pipe-cell" />)}
            </div>
          </div>
        </div>

        {state.solved ? (
          <div className="pipe-win mt-4 rounded-3xl border border-line bg-surface p-5 text-center shadow-[var(--shadow)]">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary">Pipeline healthy</p>
            <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">Every table is fresh!</p>
            <p className="mt-1 text-base text-ink-muted">
              {flow.tables} tables, {state.moves} turns,{" "}
              <span className="font-semibold text-ink">{formatTime(state.elapsed)}</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {stats.wins === 1 ? `Your first ${LEVELS[state.size].toLowerCase()} solve` : `${LEVELS[state.size]} solve #${stats.wins}`}
              </span>
              {state.newFastest && stats.wins > 1 && (
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-secondary">⚡ New fastest time</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" autoFocus onClick={() => newPuzzle()} className={primaryButton}>
                Next puzzle
              </button>
              {state.size < SIZES[SIZES.length - 1] && (
                <button type="button" onClick={() => newPuzzle((state.size + 1) as Size)} className={ghostButton}>
                  Try {LEVELS[(state.size + 1) as Size].toLowerCase()}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => newPuzzle()} className={primaryButton}>
              <RestartIcon />
              New puzzle
            </button>
            <p className="ml-auto text-sm text-ink-muted max-sm:w-full max-sm:text-center">Your puzzle saves automatically.</p>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {state.solved ? `Solved! Every table gets data. ${state.moves} turns.` : ""}
        </p>
      </div>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Board size</h2>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Board size">
            {SIZES.map((s) => {
              const active = state.ready && s === state.size;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => !active && newPuzzle(s)}
                  className={`rounded-2xl border-2 px-2 py-2 text-center transition-colors ${
                    active ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                  }`}
                >
                  <span className="block font-display text-lg font-extrabold">
                    {s}×{s}
                  </span>
                  <span className={`block text-sm ${active ? "text-bg/80" : "text-ink-muted"}`}>{LEVELS[s]}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink-muted">Switching sizes starts a new puzzle.</p>
        </section>

        <Record stats={state.stats} current={state.ready ? state.size : null} />
        {children}
      </aside>
    </div>
  );
}

function describe(kind: TileKind, cell: Cell, lit: boolean, leaks: number) {
  const sides = DIRS.filter((d) => openings(cell) & d).map((d) => SIDE_NAMES[d]);
  const what =
    kind === "source"
      ? "The source"
      : kind === "table"
        ? lit
          ? "Table, receiving data"
          : "Table, no data yet"
        : lit
          ? "Pipe carrying data"
          : "Pipe";
  return `${what}, open ${sides.join(" and ")}${lit && leaks ? ", leaking" : ""}.`;
}

const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-bg shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-0";
const ghostButton =
  "inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-5 py-2 text-base font-bold transition-colors hover:border-ink";

function Stat({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow)]">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold tabular-nums tracking-tight">{value}</p>
    </div>
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
        <span title="Paused. Resumes on your next turn." className="flex gap-[2px]">
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="sr-only">paused</span>
        </span>
      )}
    </>
  );
  return <Stat label={label} value={formatTime(clockAt({ elapsed, since }, now))} />;
}

/** Lifetime stats for this browser, one row per board size. */
function Record({ stats, current }: { stats: Stats; current: Size | null }) {
  const total = SIZES.reduce((sum, s) => sum + stats[s].wins, 0);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your record</h2>
        <p className="text-sm text-ink-muted">Saved in this browser</p>
      </div>
      <p className="mt-3 text-base text-ink-muted">
        <span className="font-display text-3xl font-extrabold tabular-nums text-ink">{total}</span>{" "}
        {total === 1 ? "pipeline" : "pipelines"} fixed
      </p>
      <table className="mt-3 w-full text-left text-base">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">
            <th className="py-1.5 font-bold">Size</th>
            <th className="py-1.5 font-bold">Solved</th>
            <th className="py-1.5 font-bold">Fastest</th>
            <th className="py-1.5 font-bold">Fewest</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {SIZES.map((s) => (
            <tr key={s} className={`border-t border-dashed border-line ${s === current ? "font-bold" : ""}`}>
              <td className="py-1.5">
                {s}×{s}
              </td>
              <td className="py-1.5">{stats[s].wins}</td>
              <td className="py-1.5 text-secondary">{stats[s].fastest === null ? "—" : formatTime(stats[s].fastest)}</td>
              <td className="py-1.5">{stats[s].fewest ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
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
