"use client";

import { useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import { bankTime, clockAt, formatTime } from "@/lib/gameClock";
import MobileView, { SHAPE_NAMES, ShapeIcon } from "./MobileView";
import {
  LEVELS,
  MAX_GUESS,
  RULES,
  countBalanced,
  emptyGame,
  hintsUsed,
  parseStats,
  reducer,
  rollSeed,
  toSaved,
  weigh,
  type Level,
  type Stats,
} from "./logic";

const SAVE_KEY = "mobiles:save";
const STATS_KEY = "mobiles:stats";

export default function MobilesGame({ children }: { children?: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyGame);
  const [selected, setSelected] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { puzzle, guesses, revealed } = state;
  const balance = puzzle ? countBalanced(puzzle.mobile, guesses) : null;
  const yourTotal = puzzle ? weigh(puzzle.mobile, guesses) : null;
  const stats = state.stats[state.level];
  const hints = hintsUsed(state);

  // Load the saved game after mount. The server-rendered HTML has no puzzle,
  // so the first client render must match it before we fill it in.
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
  // resumes on the next guess. The save is written here too, because a
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

  function guess(index: number, value: number | null) {
    dispatch({ type: "guess", index, value, now: Date.now() });
  }

  function newPuzzle(level: Level = state.level) {
    dispatch({ type: "new", level, seed: rollSeed() });
    setSelected(null);
  }

  // Tapping a shape on the mobile jumps to its guess box.
  function pick(shape: number) {
    setSelected(shape);
    if (!revealed[shape] && !state.solved) inputRefs.current[shape]?.focus();
  }

  const nextLevel = LEVELS[LEVELS.indexOf(state.level) + 1];

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,32rem)_1fr] md:items-start lg:gap-12">
      <div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Balanced" value={balance ? `${balance.balanced}/${balance.bars}` : "–"} />
          <Stat label="Weight" value={puzzle ? `${yourTotal ?? "?"}/${puzzle.total}` : "–"} />
          <Clock elapsed={state.elapsed} since={state.since} paused={state.since === null && state.elapsed > 0 && !state.solved} />
        </div>

        <div className="mobile-board" data-solved={state.solved}>
          <p className="text-center font-display text-lg font-extrabold tracking-tight">
            {puzzle ? (
              <>
                The whole mobile weighs <span className="text-primary">{puzzle.total}</span>
              </>
            ) : (
              " "
            )}
          </p>
          <div className="mx-auto mt-2 grid min-h-64 max-w-md place-items-center">
            {puzzle && (
              <MobileView
                key={state.seed}
                mobile={puzzle.mobile}
                guesses={guesses}
                selected={selected}
                onPick={pick}
              />
            )}
          </div>
        </div>

        {/* One box per shape. Typing a number tips the bars straight away. */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {guesses.map((value, i) => {
            const locked = revealed[i] || state.solved;
            return (
              <div
                key={`${state.seed}-${i}`}
                className="mobile-guess flex items-center gap-2 rounded-2xl border-2 border-line bg-surface p-2 shadow-[var(--shadow)]"
              >
                <ShapeIcon shape={i} className="h-9 w-9 shrink-0" />
                <span className="font-display text-lg font-extrabold text-ink-muted">=</span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                  {!locked && (
                    <StepButton label={`Lighter ${SHAPE_NAMES[i]}`} onClick={() => value !== null && value > 1 && guess(i, value - 1)}>
                      −
                    </StepButton>
                  )}
                  <input
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-label={`Weight of the ${SHAPE_NAMES[i]}${revealed[i] ? ", given by a hint" : ""}`}
                    placeholder="?"
                    maxLength={2}
                    readOnly={locked}
                    value={value ?? ""}
                    onFocus={(e) => {
                      setSelected(i);
                      e.target.select();
                    }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
                      const n = Number(digits);
                      guess(i, digits === "" || n === 0 ? null : Math.min(MAX_GUESS, n));
                    }}
                    onKeyDown={(e) => {
                      if (locked) return;
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        guess(i, Math.min(MAX_GUESS, (value ?? 0) + 1));
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (value !== null && value > 1) guess(i, value - 1);
                      }
                    }}
                    className={`w-12 min-w-0 rounded-xl bg-transparent text-center font-display text-2xl font-extrabold tabular-nums outline-none placeholder:text-ink-muted/50 ${
                      revealed[i] ? "text-secondary" : ""
                    }`}
                  />
                  {!locked && (
                    <StepButton label={`Heavier ${SHAPE_NAMES[i]}`} onClick={() => guess(i, Math.min(MAX_GUESS, (value ?? 0) + 1))}>
                      +
                    </StepButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {state.solved && puzzle ? (
          <div className="mobile-win mt-4 rounded-3xl border border-line bg-surface p-5 text-center shadow-[var(--shadow)]">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary">Perfectly balanced</p>
            <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">You found every weight!</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {puzzle.weights.map((w, i) => (
                <span key={i} className="inline-flex items-center gap-1 font-display text-xl font-extrabold">
                  <ShapeIcon shape={i} className="h-7 w-7" /> = {w}
                </span>
              ))}
            </div>
            <p className="mt-2 text-base text-ink-muted">
              Solved in <span className="font-semibold text-ink">{formatTime(state.elapsed)}</span>
              {hints > 0 && `, with ${hints} ${hints === 1 ? "hint" : "hints"}`}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {stats.wins === 1 ? `Your first ${RULES[state.level].label.toLowerCase()} solve` : `${RULES[state.level].label} solve #${stats.wins}`}
              </span>
              {hints === 0 && <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-secondary">★ No hints</span>}
              {state.newFastest && stats.clean > 1 && (
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-secondary">⚡ New fastest time</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" autoFocus onClick={() => newPuzzle()} className={primaryButton}>
                Next puzzle
              </button>
              {nextLevel && (
                <button type="button" onClick={() => newPuzzle(nextLevel)} className={ghostButton}>
                  Try {RULES[nextLevel].label.toLowerCase()}
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
            <button
              type="button"
              disabled={!state.ready}
              onClick={() => dispatch({ type: "hint", now: Date.now() })}
              className={ghostButton}
            >
              💡 Hint
            </button>
            <button
              type="button"
              disabled={!state.ready || guesses.every((g, i) => g === null || revealed[i])}
              onClick={() => dispatch({ type: "clear" })}
              className={`${ghostButton} disabled:opacity-50`}
            >
              Clear
            </button>
            <p className="ml-auto text-sm text-ink-muted max-sm:w-full max-sm:text-center">Your puzzle saves automatically.</p>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {state.solved
            ? "Solved! Every bar balances."
            : balance && yourTotal !== null
              ? `${balance.balanced} of ${balance.bars} bars level. Your total is ${yourTotal}.`
              : ""}
        </p>
      </div>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Level</h2>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Level">
            {LEVELS.map((level) => {
              const active = state.ready && level === state.level;
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => !active && newPuzzle(level)}
                  className={`rounded-2xl border-2 px-2 py-2 text-center transition-colors ${
                    active ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                  }`}
                >
                  <span className="block font-display text-lg font-extrabold">{RULES[level].label}</span>
                  <span className={`block text-sm ${active ? "text-bg/80" : "text-ink-muted"}`}>
                    {RULES[level].shapes} shapes
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink-muted">Switching levels starts a new puzzle.</p>
        </section>

        <Record stats={state.stats} current={state.ready ? state.level : null} />
        {children}
      </aside>
    </div>
  );
}

const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-bg shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-0";
const ghostButton =
  "inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-5 py-2 text-base font-bold transition-colors hover:border-ink";

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted font-display text-lg font-extrabold text-ink-muted transition-colors hover:bg-ink hover:text-bg"
    >
      {children}
    </button>
  );
}

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
        <span title="Paused. Resumes on your next guess." className="flex gap-[2px]">
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="h-2 w-[3px] rounded-full bg-ink-muted/70" />
          <span className="sr-only">paused</span>
        </span>
      )}
    </>
  );
  return <Stat label={label} value={formatTime(clockAt({ elapsed, since }, now))} />;
}

/** Lifetime stats for this browser, one row per level. */
function Record({ stats, current }: { stats: Stats; current: Level | null }) {
  const total = LEVELS.reduce((sum, l) => sum + stats[l].wins, 0);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your record</h2>
        <p className="text-sm text-ink-muted">Saved in this browser</p>
      </div>
      <p className="mt-3 text-base text-ink-muted">
        <span className="font-display text-3xl font-extrabold tabular-nums text-ink">{total}</span>{" "}
        {total === 1 ? "mobile" : "mobiles"} balanced
      </p>
      <table className="mt-3 w-full text-left text-base">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">
            <th className="py-1.5 font-bold">Level</th>
            <th className="py-1.5 font-bold">Solved</th>
            <th className="py-1.5 font-bold">No hints</th>
            <th className="py-1.5 font-bold">Fastest</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {LEVELS.map((l) => (
            <tr key={l} className={`border-t border-dashed border-line ${l === current ? "font-bold" : ""}`}>
              <td className="py-1.5">{RULES[l].label}</td>
              <td className="py-1.5">{stats[l].wins}</td>
              <td className="py-1.5">{stats[l].clean}</td>
              <td className="py-1.5 text-secondary">{stats[l].fastest === null ? "—" : formatTime(stats[l].fastest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-ink-muted">Fastest times only count solves without hints.</p>
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
