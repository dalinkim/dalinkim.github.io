import type { Metadata } from "next";
import Link from "next/link";
import PipeTile from "@/components/pipeline/PipeTile";
import PipelineGame from "@/components/pipeline/PipelineGame";
import { E, W, type Cell } from "@/components/pipeline/logic";
import type { TileKind } from "@/components/pipeline/PipeTile";

export const metadata: Metadata = {
  title: "Play Pipeline",
  description: "Turn the pipe tiles until data from the source reaches every table.",
};

// The title strip: source → pipe → table, already flowing.
const STRIP: { cell: Cell; kind: TileKind; from: number }[] = [
  { cell: { shape: E, rot: 0 }, kind: "source", from: 0 },
  { cell: { shape: E | W, rot: 0 }, kind: "pipe", from: W },
  { cell: { shape: W, rot: 0 }, kind: "table", from: W },
];

export default function PipelinePage() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 pt-12 sm:px-6 md:pt-16">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/play/" className="font-display text-lg font-bold text-secondary hover:underline">
              ← All games
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div aria-hidden="true" className="pipe-board-wrap w-32 -rotate-3 sm:w-40">
                <div className="pipe-board">
                  <div className="pipe-grid" style={{ "--size": 3 } as React.CSSProperties}>
                    {STRIP.map((t, i) => (
                      <div key={i} className="pipe-cell">
                        <PipeTile cell={t.cell} kind={t.kind} lit from={t.from} leaks={0} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">Pipeline</h1>
            </div>
          </div>
          <p className="max-w-sm text-lg text-ink-muted md:text-right">
            The pipes are scrambled. Turn the tiles until data from the{" "}
            <strong className="text-ink">source</strong> reaches every{" "}
            <strong className="text-ink">table</strong>, with no pipe left open.
          </p>
        </header>

        <PipelineGame>
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <h2 className="font-display text-xl font-extrabold tracking-tight">How to play</h2>
            <ul className="mt-4 space-y-3 text-base">
              <li className="flex items-center gap-3">
                <Key>Click</Key>
                <span className="text-ink-muted">or tap a tile to turn it clockwise</span>
              </li>
              <li className="flex items-center gap-3">
                <Key>Right-click</Key>
                <span className="text-ink-muted">or Shift-click to turn it back</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex gap-1">
                  <Key>←</Key>
                  <Key>↑</Key>
                  <Key>↓</Key>
                  <Key>→</Key>
                </span>
                <span className="text-ink-muted">move around, then Enter to turn</span>
              </li>
            </ul>
            <p className="mt-4 text-base text-ink-muted">
              Pipes light up <span className="font-semibold text-secondary">teal</span> once data
              reaches them, and an open end with nothing to join shows{" "}
              <span className="font-semibold text-[var(--warning)]">amber</span>. Every tile belongs
              somewhere, so a solved board uses all of them.
            </p>
          </section>

          <section className="rounded-3xl border border-dashed border-line p-5">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Why pipelines?</h2>
            <p className="mt-2 text-base text-ink-muted">
              My day job is building data platforms: making sure data gets from the systems that
              produce it to every table and dashboard that needs it. This is that job, minus the
              on-call.
            </p>
          </section>
        </PipelineGame>
      </div>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-8 min-w-8 shrink-0 place-items-center rounded-lg border border-line border-b-[3px] bg-surface-muted px-1.5 font-mono text-sm font-bold text-ink">
      {children}
    </kbd>
  );
}
