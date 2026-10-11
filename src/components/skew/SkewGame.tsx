"use client";

import "./skew.css";
import { useEffect, useEffectEvent, useReducer, useRef, useState } from "react";
import { bankTime, clockAt, formatTime } from "@/lib/gameClock";
import { rollSeed } from "@/lib/random";
import {
  HUES,
  LEVELS,
  LEVEL_ORDER,
  canSalt,
  emptyGame,
  loadsOf,
  parseStats,
  reducer,
  saltHalves,
  toSaved,
  type Level,
  type Stats,
  type Task,
} from "./logic";

const SAVE_KEY = "skew:save";
const STATS_KEY = "skew:stats";

/** Where a task can be dropped: a worker index, or back in the queue. */
type Target = number | "queue";

type Drag = {
  id: number;
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
};

export default function SkewGame({ children }: { children?: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyGame);
  const [selected, setSelected] = useState<number | null>(null);
  const [ghost, setGhost] = useState<{ id: number; x: number; y: number } | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const drag = useRef<Drag | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);

  const { workers, salts } = LEVELS[state.level];
  const loads = loadsOf(state.tasks, workers);
  const stage = Math.max(0, ...loads);
  const queue = state.tasks.filter((t) => t.worker === null).sort((a, b) => b.size - a.size || a.id - b.id);
  const playing = state.ready && state.status === "playing";
  const selectedTask = playing ? state.tasks.find((t) => t.id === selected) : undefined;
  // Lanes are drawn to scale. Leave headroom past par, and grow if a lane overflows.
  const scale = Math.max(Math.ceil(state.par * 1.25), ...loads, ...state.tasks.map((t) => t.size), 1);
  const straggler = playing && stage > 0 && loads.filter((l) => l === stage).length < workers ? loads.indexOf(stage) : -1;
  const stats = state.stats[state.level];

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
  // resumes on the next move. The save is written here too, because a
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

  function move(id: number, to: Target) {
    dispatch({ type: "move", id, worker: to === "queue" ? null : to, now: Date.now() });
    setSelected(null);
  }

  function salt(id: number) {
    dispatch({ type: "salt", id, now: Date.now() });
    setSelected(null);
  }

  function newPuzzle(level: Level = state.level) {
    dispatch({ type: "new", level, seed: rollSeed() });
    setSelected(null);
  }

  // Keyboard: pick a task with Tab and Enter, then a number sends it to that
  // worker. useEffectEvent sees the latest state, so the listener is added once.
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const key = e.key.toLowerCase();
    if (key === "n") return newPuzzle();
    if (!playing) return;
    if (key === "r") return dispatch({ type: "reset" });
    if (!selectedTask) return;
    const n = Number(key);
    if (Number.isInteger(n) && n >= 1 && n <= workers) move(selectedTask.id, n - 1);
    else if (key === "0" || key === "q") move(selectedTask.id, "queue");
    else if (key === "s" && canSalt(selectedTask, state.saltsLeft)) salt(selectedTask.id);
    else if (key === "escape") setSelected(null);
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ---------- Dragging ----------
  // Pointer events cover mouse, touch and pen with one set of handlers.
  // Pointer capture keeps the move and up events coming to the task even
  // when the pointer leaves it. A press that barely moves stays a tap, and
  // the click handler treats it as select.

  function dropTargetAt(x: number, y: number): Target | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop]");
    if (!el) return null;
    return el.dataset.drop === "queue" ? "queue" : Number(el.dataset.drop);
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>, task: Task) {
    suppressClick.current = false;
    if (!playing || e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = {
      id: task.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      active: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.active && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6) return;
    d.active = true;
    // The ghost is positioned inside the board wrapper, so convert from
    // viewport coordinates to the wrapper's.
    const box = wrapRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    setGhost({ id: d.id, x: e.clientX - d.offsetX - box.left, y: e.clientY - d.offsetY - box.top });
    setTarget(dropTargetAt(e.clientX, e.clientY));
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClick.current = true;
    setGhost(null);
    setTarget(null);
    const to = dropTargetAt(e.clientX, e.clientY);
    if (to !== null) move(d.id, to);
  }

  function onPointerCancel() {
    drag.current = null;
    setGhost(null);
    setTarget(null);
  }

  function onTaskClick(e: React.MouseEvent, task: Task) {
    e.stopPropagation();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSelected(selected === task.id ? null : task.id);
  }

  function renderTask(task: Task) {
    const where = task.worker === null ? "in the queue" : `on worker ${task.worker + 1}`;
    return (
      <button
        key={task.id}
        type="button"
        className="skew-task"
        data-salted={task.salted}
        data-dragging={ghost?.id === task.id}
        aria-pressed={selected === task.id}
        aria-label={`${task.salted ? "Salted task" : "Task"}, ${task.size} seconds, ${where}`}
        disabled={!playing}
        style={{ "--size": task.size, "--hue": HUES[task.origin % HUES.length] } as React.CSSProperties}
        onPointerDown={(e) => onPointerDown(e, task)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={(e) => onTaskClick(e, task)}
      >
        {task.size}s
      </button>
    );
  }

  const ghostTask = ghost && state.tasks.find((t) => t.id === ghost.id);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,32rem)_1fr] md:items-start lg:gap-12">
      <div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Stage" value={state.ready ? `${stage}s` : "–"} tone={state.status === "solved" ? "good" : straggler >= 0 && stage > state.par ? "warn" : undefined} />
          <Stat label="Par" value={state.ready ? `${state.par}s` : "–"} />
          <Clock elapsed={state.elapsed} since={state.since} paused={state.since === null && state.elapsed > 0 && playing} />
        </div>

        <div ref={wrapRef} className="skew-wrap">
          <div
            className="skew-board"
            data-solved={state.status === "solved"}
            style={{ "--scale": scale, "--par": state.par } as React.CSSProperties}
          >
            <div
              className="skew-zone min-h-[4.6rem] p-2"
              data-drop="queue"
              data-target={target === "queue"}
              onClick={() => selectedTask && selectedTask.worker !== null && move(selectedTask.id, "queue")}
            >
              <p className="px-1 pb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Queue · {queue.length} {queue.length === 1 ? "task" : "tasks"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {queue.map(renderTask)}
                {state.ready && queue.length === 0 && (
                  <p className="grid h-[2.75rem] items-center px-1 text-sm text-ink-muted">
                    {playing ? "Every task is on a worker." : "Done."}
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-5 space-y-2.5">
              {state.ready && <div className="skew-par" aria-hidden="true" />}
              {Array.from({ length: state.ready ? workers : 3 }, (_, w) => (
                <div key={w} className="skew-lane">
                  <button
                    type="button"
                    disabled={!selectedTask}
                    onClick={() => selectedTask && move(selectedTask.id, w)}
                    aria-label={`Worker ${w + 1}, ${loads[w] ?? 0} seconds${selectedTask ? `. Move the selected task here` : ""}`}
                    className={`rounded-xl px-1.5 py-1 text-left transition-colors enabled:hover:bg-surface/60 ${
                      selectedTask ? "ring-2 ring-primary/60" : ""
                    }`}
                  >
                    <span className="block whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">Worker {w + 1}</span>
                    <span className={`block font-display text-lg font-extrabold tabular-nums ${w === straggler ? "text-primary" : ""}`}>
                      {loads[w] ?? 0}s
                    </span>
                  </button>
                  <div
                    className="skew-zone skew-track"
                    data-drop={w}
                    data-target={target === w}
                    data-straggler={w === straggler}
                    onClick={() => selectedTask && move(selectedTask.id, w)}
                  >
                    {state.tasks.filter((t) => t.worker === w).map(renderTask)}
                  </div>
                </div>
              ))}
              {state.ready && (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-muted"
                  style={{ left: `calc(var(--label) + var(--gap) + var(--par) * var(--unit) - 0.9rem)` }}
                >
                  par
                </p>
              )}
            </div>

            {salts > 0 && state.ready && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-ink-muted/30 pt-3">
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-muted">
                  Salts
                  {Array.from({ length: salts }, (_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-3 rounded-full ${i < state.saltsLeft ? "bg-ink" : "border-2 border-ink-muted/50"}`}
                    />
                  ))}
                  <span className="sr-only">{state.saltsLeft} left</span>
                </p>
                <button
                  type="button"
                  disabled={!selectedTask || !canSalt(selectedTask, state.saltsLeft)}
                  onClick={() => selectedTask && salt(selectedTask.id)}
                  className="ml-auto rounded-full border-2 border-ink px-3.5 py-1 text-sm font-bold transition-colors enabled:hover:bg-ink enabled:hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selectedTask && canSalt(selectedTask, state.saltsLeft)
                    ? `Salt ${selectedTask.size}s → ${saltHalves(selectedTask.size).join("s + ")}s`
                    : "Salt selected task"}
                </button>
              </div>
            )}

            {ghostTask && ghost && (
              <div
                aria-hidden="true"
                className="skew-task skew-ghost grid place-items-center"
                data-salted={ghostTask.salted}
                style={
                  {
                    "--size": ghostTask.size,
                    "--hue": HUES[ghostTask.origin % HUES.length],
                    "--x": `${ghost.x}px`,
                    "--y": `${ghost.y}px`,
                  } as React.CSSProperties
                }
              >
                {ghostTask.size}s
              </div>
            )}
          </div>
        </div>

        {state.status === "solved" && (
          <div className="skew-win mt-4 rounded-3xl border border-line bg-surface p-5 text-center shadow-[var(--shadow)]">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-secondary">Stage complete</p>
            <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">Perfectly balanced!</p>
            <p className="mt-1 text-base text-ink-muted">
              {state.par}s stage time is par: no split can beat it. {state.moves} moves,{" "}
              <span className="font-semibold text-ink">{formatTime(state.elapsed)}</span>
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {stats.wins === 1 ? `Your first ${LEVELS[state.level].name.toLowerCase()} solve` : `${LEVELS[state.level].name} solve #${stats.wins}`}
              </span>
              {state.newFastest && stats.wins > 1 && (
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-secondary">⚡ New fastest time</span>
              )}
            </div>
            <NextButtons level={state.level} onNew={newPuzzle} />
          </div>
        )}

        {state.status === "revealed" && (
          <div className="skew-win mt-4 rounded-3xl border border-dashed border-line p-5 text-center">
            <p className="font-display text-2xl font-extrabold tracking-tight">Here&apos;s one {state.par}s split</p>
            <p className="mt-1 text-base text-ink-muted">There may be others. This one doesn&apos;t count toward your record.</p>
            <NextButtons level={state.level} onNew={newPuzzle} />
          </div>
        )}

        {state.status === "playing" && (
          <>
            <p className="mt-4 min-h-[3rem] text-base text-ink-muted" aria-live="polite">
              {!state.ready
                ? ""
                : queue.length === 0 && stage > state.par
                  ? `Every task is placed: ${stage}s against a par of ${state.par}s. Shuffle to shave off ${stage - state.par}s.`
                  : selectedTask
                    ? `${selectedTask.size}s task selected. Tap a worker or press 1–${workers}${
                        canSalt(selectedTask, state.saltsLeft) ? ", or salt it with S" : ""
                      }.`
                    : "Drag a task onto a worker, or tap a task and then a worker."}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => newPuzzle()} className={primaryButton}>
                <RestartIcon />
                New puzzle
              </button>
              <button type="button" onClick={() => dispatch({ type: "reset" })} className={ghostButton}>
                Reset
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "reveal", now: Date.now() })}
                className="ml-auto text-sm font-semibold text-ink-muted underline decoration-dotted underline-offset-4 hover:text-ink"
              >
                Show a solution
              </button>
            </div>
          </>
        )}
        <p className="sr-only" aria-live="polite">
          {state.status === "solved" ? `Solved! Stage time ${state.par} seconds matches par.` : ""}
        </p>
      </div>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Level</h2>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Level">
            {LEVEL_ORDER.map((level) => {
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
                  <span className="block font-display text-lg font-extrabold">{LEVELS[level].name}</span>
                  <span className={`block text-sm ${active ? "text-bg/80" : "text-ink-muted"}`}>{LEVELS[level].workers} workers</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            {LEVELS[state.level].blurb} Switching levels starts a new puzzle.
          </p>
        </section>

        <Record stats={state.stats} current={state.ready ? state.level : null} />
        {children}
      </aside>
    </div>
  );
}

function NextButtons({ level, onNew }: { level: Level; onNew: (level?: Level) => void }) {
  const next = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1];
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" autoFocus onClick={() => onNew()} className={primaryButton}>
        Next puzzle
      </button>
      {next && (
        <button type="button" onClick={() => onNew(next)} className={ghostButton}>
          Try {LEVELS[next].name}
        </button>
      )}
    </div>
  );
}

const primaryButton =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-bg shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-0";
const ghostButton =
  "inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-5 py-2 text-base font-bold transition-colors hover:border-ink";

function Stat({ label, value, tone }: { label: React.ReactNode; value: string; tone?: "good" | "warn" }) {
  const color = tone === "good" ? "text-secondary" : tone === "warn" ? "text-primary" : "";
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow)]">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className={`font-display text-2xl font-extrabold tabular-nums tracking-tight ${color}`}>{value}</p>
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

/** Lifetime stats for this browser, one row per level. */
function Record({ stats, current }: { stats: Stats; current: Level | null }) {
  const total = LEVEL_ORDER.reduce((sum, l) => sum + stats[l].wins, 0);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your record</h2>
        <p className="text-sm text-ink-muted">Saved in this browser</p>
      </div>
      <p className="mt-3 text-base text-ink-muted">
        <span className="font-display text-3xl font-extrabold tabular-nums text-ink">{total}</span>{" "}
        {total === 1 ? "stage" : "stages"} balanced
      </p>
      <table className="mt-3 w-full text-left text-base">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">
            <th className="py-1.5 font-bold">Level</th>
            <th className="py-1.5 font-bold">Solved</th>
            <th className="py-1.5 font-bold">Fastest</th>
            <th className="py-1.5 font-bold">Fewest</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {LEVEL_ORDER.map((l) => (
            <tr key={l} className={`border-t border-dashed border-line ${l === current ? "font-bold" : ""}`}>
              <td className="py-1.5">{LEVELS[l].name}</td>
              <td className="py-1.5">{stats[l].wins}</td>
              <td className="py-1.5 text-secondary">{stats[l].fastest === null ? "—" : formatTime(stats[l].fastest)}</td>
              <td className="py-1.5">{stats[l].fewest ?? "—"}</td>
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
