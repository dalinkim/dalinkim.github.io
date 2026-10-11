import type { Metadata } from "next";
import Link from "next/link";
import MobilesGame from "@/components/mobiles/MobilesGame";
import MobilesPreview from "@/components/mobiles/MobilesPreview";

export const metadata: Metadata = {
  title: "Play Mobiles",
  description: "Every bar on the mobile balances. Work out what each shape weighs.",
};

export default function MobilesPage() {
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
              <MobilesPreview className="w-28 -rotate-3 sm:w-36" />
              <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">Mobiles</h1>
            </div>
          </div>
          <p className="max-w-sm text-lg text-ink-muted md:text-right">
            Every bar on this mobile hangs perfectly level. Each kind of shape has a secret weight.
            Can you work out what they are?
          </p>
        </header>

        <MobilesGame>
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <h2 className="font-display text-xl font-extrabold tracking-tight">How to play</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-ink-muted">
              <li>Every shape of the same kind weighs the same whole number.</li>
              <li>Each bar balances, so both of its sides weigh the same.</li>
              <li>Type a weight for each shape, or use − and +. Tap a shape on the mobile to jump to its box.</li>
              <li>
                Your guesses tip the bars: the heavier side drops. A bar turns{" "}
                <span className="font-semibold text-secondary">teal</span> when it balances.
              </li>
              <li>Balance every bar with the right total weight to win.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-dashed border-line p-5">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Secretly, it&apos;s algebra</h2>
            <p className="mt-2 text-base text-ink-muted">
              If two circles balance one triangle, then a triangle weighs the same as two circles.
              That&apos;s an equation: <span className="font-mono text-ink">2c = t</span>. Every bar
              is one equation, and the total weight is one more.
            </p>
            <p className="mt-3 text-base text-ink-muted">
              A good trick: start at the top. The top bar splits the total in half, so each side
              weighs half the total. Then work your way down.
            </p>
            <p className="mt-3 text-base text-ink-muted">
              Every puzzle is checked to make sure it has exactly one answer.
            </p>
          </section>
        </MobilesGame>
      </div>
    </div>
  );
}
