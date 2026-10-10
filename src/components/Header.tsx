import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/blog/", label: "Blog" },
  { href: "/about/", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-xl font-extrabold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-base text-bg transition-transform group-hover:-rotate-6"
          >
            D
          </span>
          Dalin Kim
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-1.5 text-base font-semibold text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink sm:px-3"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/play/"
            aria-label="Play a game"
            title="Play a game"
            className="group flex items-center gap-2 rounded-full p-2 text-base font-semibold text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink sm:py-1.5 sm:pl-2.5 sm:pr-3.5"
          >
            <TilesIcon />
            <span className="hidden sm:inline">Play</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

/** Four mini tiles in the 128 palette. They shuffle a little on hover. */
function TilesIcon() {
  return (
    <span aria-hidden="true" className="grid h-5 w-5 grid-cols-2 gap-[2px]">
      <span className="rounded-[3px] bg-[hsl(30_95%_66%)] transition-transform group-hover:-translate-y-0.5" />
      <span className="rounded-[3px] bg-[hsl(340_78%_54%)] transition-transform delay-75 group-hover:translate-x-0.5" />
      <span className="rounded-[3px] bg-[hsl(265_72%_58%)] transition-transform delay-100 group-hover:-translate-x-0.5" />
      <span className="rounded-[3px] bg-[hsl(42_100%_55%)] transition-transform delay-150 group-hover:translate-y-0.5" />
    </span>
  );
}
