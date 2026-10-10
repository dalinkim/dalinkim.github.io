import Link from "next/link";
import TileFace from "./TileFace";

// A frozen mid-game board: [value, col, row].
const PREVIEW: [number, number, number][] = [
  [2, 0, 0],
  [8, 2, 0],
  [4, 3, 0],
  [16, 1, 1],
  [64, 2, 1],
  [128, 0, 2],
  [256, 1, 2],
  [512, 2, 2],
  [1024, 3, 2],
  [4, 0, 3],
  [2, 3, 3],
];

export default function PlayTeaser() {
  return (
    <Link
      href="/play/"
      className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow)] transition-transform hover:-translate-y-1 sm:flex-row sm:items-center sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(hsl(42_100%_55%/0.25),transparent_70%)]"
      />
      <div className="relative flex-1">
        <p className="font-display text-base font-bold text-secondary">Need a break?</p>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Play 1024</h2>
        <p className="mt-2 text-base text-ink-muted">
          My take on 2048, cut in half for a coffee break. Slide, merge and climb to 2<sup>10</sup>.
        </p>
        <span className="mt-4 inline-flex items-center gap-1 font-bold text-primary">
          Start a game
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>

      <div
        aria-hidden="true"
        className="relative grid w-44 shrink-0 rotate-3 grid-cols-4 gap-1.5 self-center rounded-2xl bg-surface-muted p-1.5 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
      >
        {Array.from({ length: 16 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const tile = PREVIEW.find(([, c, r]) => c === col && r === row);
          return tile ? (
            <TileFace
              key={i}
              value={tile[0]}
              className="aspect-square rounded-md text-[0.6rem] [--tile-depth:2px]"
            />
          ) : (
            <div key={i} className="aspect-square rounded-md bg-bg/60" />
          );
        })}
      </div>
    </Link>
  );
}
