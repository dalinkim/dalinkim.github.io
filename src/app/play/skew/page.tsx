import type { Metadata } from "next";
import Link from "next/link";
import SkewGame from "@/components/skew/SkewGame";
import SkewPreview from "@/components/skew/SkewPreview";

export const metadata: Metadata = {
  title: "Play Skew",
  description: "Balance tasks across workers so the stage finishes as early as possible. Hit par to win.",
};

export default function SkewPage() {
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
              <SkewPreview className="w-28 -rotate-3 sm:w-36" />
              <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">Skew</h1>
            </div>
          </div>
          <p className="max-w-sm text-lg text-ink-muted md:text-right">
            A stage only finishes when its slowest worker does. Spread the tasks so the busiest
            worker finishes at <strong className="text-ink">par</strong>, the best time possible.
          </p>
        </header>

        <SkewGame>
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <h2 className="font-display text-xl font-extrabold tracking-tight">How to play</h2>
            <ul className="mt-4 space-y-3 text-base">
              <li className="flex items-center gap-3">
                <Key>Drag</Key>
                <span className="text-ink-muted">a task onto a worker, or tap the task, then the worker</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex gap-1">
                  <Key>1</Key>
                  <Key>2</Key>
                  <Key>3</Key>
                </span>
                <span className="text-ink-muted">send the selected task to a worker, 0 for the queue</span>
              </li>
              <li className="flex items-center gap-3">
                <Key>S</Key>
                <span className="text-ink-muted">salt the selected task (Salted level)</span>
              </li>
              <li className="flex items-center gap-3">
                <Key>R</Key>
                <span className="text-ink-muted">reset the board, N for a new puzzle</span>
              </li>
            </ul>
            <p className="mt-4 text-base text-ink-muted">
              A worker&apos;s time is the sum of its tasks. The busiest one, the{" "}
              <span className="font-semibold text-primary">straggler</span>, sets the stage time.
              Place every task with the stage time at par and you win: no split can do better.
            </p>
          </section>

          <section className="rounded-3xl border border-dashed border-line p-5">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Why skew?</h2>
            <p className="mt-2 text-base text-ink-muted">
              In Spark, a stage waits for its slowest task. When one partition holds far more data
              than the rest (data skew), a whole cluster sits idle waiting on one worker. A common
              fix is <strong className="text-ink">salting</strong>: add a random value to the hot
              key so its rows split across more partitions, at the cost of a little extra work.
            </p>
            <p className="mt-3 text-base text-ink-muted">
              Splitting work evenly is also a famously hard problem (the partition problem). Biggest
              task first onto the least busy worker gets close, but on the harder levels it never
              quite reaches par.
            </p>
          </section>
        </SkewGame>
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
