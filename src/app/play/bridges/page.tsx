import type { Metadata } from "next";
import Link from "next/link";
import BridgesGame from "@/components/bridges/BridgesGame";
import BridgesPreview from "@/components/bridges/BridgesPreview";

export const metadata: Metadata = {
  title: "Play Bridges",
  description: "Join the islands with bridges so each one has exactly as many as its number, all in one network.",
};

export default function BridgesPage() {
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
              <BridgesPreview className="w-28 -rotate-3 sm:w-36" />
              <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">Bridges</h1>
            </div>
          </div>
          <p className="max-w-sm text-lg text-ink-muted md:text-right">
            Each island says how many bridges it needs. Build them all so every island is linked
            into one network.
          </p>
        </header>

        <BridgesGame>
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <h2 className="font-display text-xl font-extrabold tracking-tight">How to play</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-ink-muted">
              <li>Tap the water between two islands to build a bridge. Tap again for a double, and once more to remove it.</li>
              <li>Each island needs exactly as many bridges as its number. It turns teal when it has them.</li>
              <li>Bridges run straight across or down, and they can&apos;t cross each other.</li>
              <li>Every island has to link up into one network.</li>
              <li>Right-click or Shift-click goes backwards. On a keyboard, Tab to a gap and press Enter.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-dashed border-line p-5">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Tricks to look for</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-base text-ink-muted">
              <li>
                An island whose number is twice how many neighbours it has (a{" "}
                <strong className="text-ink">4</strong> with two, a{" "}
                <strong className="text-ink">6</strong> with three) needs double bridges to all of them.
              </li>
              <li>
                A <strong className="text-ink">7</strong> with four neighbours gets at least one
                bridge to every one of them. Can you see why?
              </li>
              <li>
                Two <strong className="text-ink">1</strong>s can&apos;t join each other: they&apos;d
                be cut off from everyone else.
              </li>
            </ul>
            <p className="mt-3 text-base text-ink-muted">
              Every puzzle is checked by a solver to make sure it has exactly one answer, so you
              never need to guess.
            </p>
          </section>
        </BridgesGame>
      </div>
    </div>
  );
}
