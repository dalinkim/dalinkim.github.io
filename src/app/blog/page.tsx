import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and essays on data engineering, platforms and learning in public.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 md:pt-20">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Blog</h1>
      <p className="mt-4 text-xl text-ink-muted">
        Notes and essays on data engineering, platforms and learning in public.
      </p>
      <div className="mt-12 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
