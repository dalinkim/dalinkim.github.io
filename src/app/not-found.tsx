import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-display text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">This page wandered off.</h1>
      <p className="mt-3 text-ink-muted">The link may be old, or the page never existed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 font-bold text-bg transition-transform hover:-translate-y-0.5"
        >
          Back home
        </Link>
        <Link
          href="/play/"
          className="rounded-full border-2 border-line px-6 py-3 font-bold transition-colors hover:border-ink"
        >
          Play 128 instead
        </Link>
      </div>
    </div>
  );
}
