// A pausable stopwatch stored as plain data, shared by the games in /play/.
// `elapsed` is banked time in ms. `since` is when the current running
// stretch began (null while stopped or paused). Live time is
// elapsed + (now - since). Callers pass `now` in, so reducers stay pure.

export type ClockState = { elapsed: number; since: number | null };

/** Stop the clock and bank the running stretch. */
export function bankTime<T extends ClockState>(clock: T, now: number): T {
  if (clock.since === null) return clock;
  return { ...clock, elapsed: clock.elapsed + Math.max(0, now - clock.since), since: null };
}

/** Live clock reading in ms. */
export function clockAt(clock: ClockState, now: number) {
  return clock.elapsed + (clock.since === null ? 0 : Math.max(0, now - clock.since));
}

export function formatTime(ms: number) {
  const tenths = Math.floor(ms / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths % 10}`;
}
