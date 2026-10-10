import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingMinutes: number;
}

export interface Post extends PostMeta {
  content: string;
}

function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  const words = content.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title,
    date: data.date,
    description: data.description ?? "",
    tags: data.tags ?? [],
    readingMinutes: Math.max(1, Math.round(words / 230)),
    content,
  };
}

/** All posts, newest first. Runs at build time only. */
export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...meta } = readPost(file.replace(/\.mdx$/, ""));
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post {
  return readPost(slug);
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
