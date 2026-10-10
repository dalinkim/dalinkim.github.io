import type { Metadata } from "next";
import Link from "next/link";
import BoardPreview from "@/components/game128/BoardPreview";
import PipelinePreview from "@/components/pipeline/PipelinePreview";

export const metadata: Metadata = {
  title: "Play",
  description: "Quick browser games for a coffee break: 128 and Pipeline.",
};

const GAMES = [
  {
    href: "/play/128/",
    title: "128",
    blurb: "My take on 2048, shrunk to fit a coffee break. Slide the tiles, merge matching numbers and climb to 2⁷.",
    tags: ["Sliding tiles", "A few minutes"],
    preview: <BoardPreview className="w-40 rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105" />,
  },
  {
    href: "/play/pipeline/",
    title: "Pipeline",
    blurb: "The pipes are scrambled. Turn the tiles until data from the source reaches every table, with no pipe left open.",
    tags: ["Logic puzzle", "3 board sizes"],
    preview: <PipelinePreview className="w-40 -rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105" />,
  },
];

export default function PlayPage() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 pt-12 sm:px-6 md:pt-16">
        <header className="mb-10 max-w-2xl">
          <p className="font-display text-lg font-bold text-secondary">Take a break</p>
          <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">Pick a game</h1>
          <p className="mt-3 text-lg text-ink-muted">
            Small puzzles that run right in your browser. Your progress and records are saved on this
            device.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow)] transition-transform hover:-translate-y-1"
            >
              <div className="grid place-items-center bg-surface-muted/60 py-8">{game.preview}</div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">{game.title}</h2>
                <p className="mt-2 flex-1 text-base text-ink-muted">{game.blurb}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-ink-muted">
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1 font-bold text-primary">
                    Play
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
