import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group relative">
      <Link href={`/blog/${post.slug}/`} className="block rounded-2xl p-5 -mx-5 transition-colors hover:bg-surface">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          {post.placeholder && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
              Placeholder
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 text-ink-muted">{post.description}</p>
        <span className="mt-3 inline-flex items-center gap-1 font-semibold text-primary">
          Read more
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </Link>
    </article>
  );
}
