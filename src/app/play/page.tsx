import type { Metadata } from "next";
import Game1024 from "@/components/game1024/Game1024";
import TileFace from "@/components/game1024/TileFace";

export const metadata: Metadata = {
  title: "Play 1024",
  description: "A quick-fire take on 2048. Slide the tiles, merge the numbers, reach 1024.",
};

const TITLE = [
  { char: "1", value: 16, tilt: "-rotate-6" },
  { char: "0", value: 64, tilt: "rotate-3" },
  { char: "2", value: 256, tilt: "-rotate-2" },
  { char: "4", value: 1024, tilt: "rotate-6" },
];

export default function PlayPage() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 pt-12 sm:px-6 md:pt-16">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-secondary">Take a break</p>
            <h1 className="mt-3 flex gap-2 sm:gap-3">
              <span className="sr-only">1024</span>
              {TITLE.map((t) => (
                <TileFace
                  key={t.char}
                  value={t.value}
                  className={`title-tile h-16 w-16 rounded-2xl text-4xl sm:h-20 sm:w-20 sm:text-5xl ${t.tilt} [--tile-depth:5px]`}
                >
                  <span aria-hidden="true">{t.char}</span>
                </TileFace>
              ))}
            </h1>
          </div>
          <p className="max-w-sm text-lg text-ink-muted md:text-right">
            It&apos;s 2048, cut in half so it fits a coffee break. Slide the tiles, merge matching
            numbers and climb to <strong className="text-ink">1024</strong>.
          </p>
        </header>

        <Game1024>
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <h2 className="font-display text-xl font-extrabold tracking-tight">How to play</h2>
            <ul className="mt-4 space-y-3 text-base">
              <li className="flex items-center gap-3">
                <span className="flex gap-1">
                  <Key>←</Key>
                  <Key>↑</Key>
                  <Key>↓</Key>
                  <Key>→</Key>
                </span>
                <span className="text-ink-muted">or WASD, or swipe</span>
              </li>
              <li className="flex items-center gap-3">
                <Key>U</Key>
                <span className="text-ink-muted">undo one move</span>
              </li>
              <li className="flex items-center gap-3">
                <Key>N</Key>
                <span className="text-ink-muted">start a new game</span>
              </li>
            </ul>
            <p className="mt-4 text-base text-ink-muted">
              Every move slides all the tiles as far as they go. Two tiles with the same number
              merge into one, and a new 2 or 4 drops in.
            </p>
          </section>

          <section className="rounded-3xl border border-dashed border-line p-5">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Why 1024?</h2>
            <p className="mt-2 text-base text-ink-muted">
              1024 is 2<sup>10</sup>, the number of bytes in a kibibyte and a very satisfying
              number for anyone who works with data. It also takes roughly half the moves of the
              original game, so a full run fits in a few minutes.
            </p>
          </section>
        </Game1024>
      </div>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-8 min-w-8 place-items-center rounded-lg border border-line border-b-[3px] bg-surface-muted px-1.5 font-mono text-sm font-bold text-ink">
      {children}
    </kbd>
  );
}
