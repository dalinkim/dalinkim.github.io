import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Callout from "@/components/Callout";
import { formatDate, getAllPosts, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

// Static export: every post page is generated at build time, nothing else exists.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  return (
    <article className="mx-auto max-w-2xl px-4 pt-12 sm:px-6 md:pt-20">
      <Link href="/blog/" className="font-semibold text-ink-muted transition-colors hover:text-primary">
        ← All posts
      </Link>

      <header className="mt-8 border-b border-line pb-8">
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-ink-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-muted px-2.5 py-0.5 text-sm font-semibold">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose mt-10">
        <MDXRemote
          source={post.content}
          components={{ Callout }}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
        />
      </div>
    </article>
  );
}
