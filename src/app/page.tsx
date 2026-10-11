import Link from "next/link";
import PlayTeaser from "@/components/PlayTeaser";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-24">
          <div>
            <p className="mb-4 font-display text-lg font-bold text-secondary">
              Hello! <span lang="ko">안녕하세요!</span>
            </p>
            <h1 className="font-display text-[clamp(1.9rem,9vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight">
              I&apos;m Dalin. I work with{" "}
              <span className="relative whitespace-nowrap text-primary">
                AI &amp; data platforms
                <Squiggle />
              </span>
              .
            </h1>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/blog/"
                className="rounded-full bg-primary px-6 py-3 font-bold text-bg shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5"
              >
                Read the blog
              </Link>
              <Link
                href="/about/"
                className="rounded-full border-2 border-line px-6 py-3 font-bold transition-colors hover:border-ink"
              >
                About me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Recent writing</h2>
          <Link href="/blog/" className="shrink-0 font-semibold text-primary hover:underline">
            All posts →
          </Link>
        </div>
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
        <PlayTeaser />
      </section>
    </>
  );
}

function Squiggle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className="absolute -bottom-2 left-0 h-3 w-full text-secondary"
    >
      <path
        d="M2 8 Q 18 2, 34 7 T 66 7 T 98 7 T 130 7 T 162 7 T 198 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
