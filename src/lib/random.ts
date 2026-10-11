// Seeded randomness shared by the games in /play/. A puzzle is generated
// from a seed inside the reducer, so the reducer stays pure: the only
// Math.random() call is rollSeed(), which runs in event handlers.

/**
 * A small seeded random number generator (mulberry32). The same seed always
 * gives the same numbers, so a puzzle is fully described by its seed.
 */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}
