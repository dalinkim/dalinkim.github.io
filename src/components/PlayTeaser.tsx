import Link from "next/link";
import BoardPreview from "./game128/BoardPreview";
import PipelinePreview from "./pipeline/PipelinePreview";

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
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Play a game</h2>
        <p className="mt-2 text-base text-ink-muted">
          Two quick puzzles: slide and merge tiles up to 2<sup>7</sup> in 128, or turn the pipes in
          Pipeline until data reaches every table.
        </p>
        <span className="mt-4 inline-flex items-center gap-1 font-bold text-primary">
          Pick a game
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>

      {/* Two boards fanned like cards. They straighten up on hover. */}
      <div aria-hidden="true" className="relative h-44 w-52 shrink-0 self-center">
        <PipelinePreview className="absolute left-0 top-2 w-36 -rotate-6 transition-transform duration-300 group-hover:-translate-x-1 group-hover:rotate-[-3deg]" />
        <BoardPreview className="absolute bottom-0 right-0 w-36 rotate-6 shadow-[var(--shadow)] transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-3" />
      </div>
    </Link>
  );
}
