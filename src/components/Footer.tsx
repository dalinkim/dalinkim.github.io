import Link from "next/link";

const LINKS = [
  { href: "https://github.com/dalinkim", label: "GitHub" },
  { href: "https://www.linkedin.com/in/dalinkim/", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-muted/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-lg font-extrabold">Dalin Kim</p>
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} · Built with Next.js, hosted on GitHub Pages
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold">
          <Link href="/blog/" className="text-ink-muted transition-colors hover:text-primary">
            Blog
          </Link>
          <Link href="/about/" className="text-ink-muted transition-colors hover:text-primary">
            About
          </Link>
          <Link href="/play/" className="text-ink-muted transition-colors hover:text-primary">
            Play 1024
          </Link>
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
