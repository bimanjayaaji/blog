// Helpers for working with posts, shared by the blog list and the post pages.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * All posts that should appear on the site, newest first.
 * Drafts are included while developing (`npm run dev`) and left out of the real build.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (post) => import.meta.env.DEV || !post.data.draft);
  for (const post of posts) checkPostName(post);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * Some addresses under /blog/ belong to other pages: /blog/2025/ (a year) and
 * /blog/tag/ (the tags). A post file with such a name would collide with them, so the
 * build stops here with a message instead of quietly showing the wrong page.
 */
function checkPostName(post: Post): void {
  if (/^\d{4}$/.test(post.id) || post.id === 'tag') {
    throw new Error(
      `The post file "src/content/posts/${post.id}.md" can't be called "${post.id}": ` +
        `/blog/${post.id}/ is already used for ${post.id === 'tag' ? 'the tags page' : "that year's page"}. ` +
        `Rename the file (e.g. "${post.id}-${post.id === 'tag' ? 'post' : 'recap'}.md").`,
    );
  }
}

/** The URL of a post's page. */
export function postUrl(post: Post): string {
  return `/blog/${post.id}/`;
}

/**
 * "2 November 2025". Formatted in UTC: a date written as 2025-11-02 means midnight UTC,
 * and formatting it in a timezone behind UTC would show 1 November.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "9 Nov": the date without its year, for lists grouped by year. UTC, like formatDate. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** A post's year, e.g. 2025 (UTC, like the dates). */
export function postYear(post: Post): number {
  return post.data.date.getUTCFullYear();
}

/**
 * Posts split into years, newest year first: [{ year: 2026, posts: [...] }, ...].
 * Keeps the posts' order within a year (getPosts() gives newest first). Years without posts don't appear.
 */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = postYear(post);
    if (!years.has(year)) years.set(year, []);
    years.get(year)!.push(post);
  }
  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, posts]) => ({ year, posts }));
}

/** The URL of a year's page: /blog/2025/. */
export function yearUrl(year: number): string {
  return `/blog/${year}/`;
}

/**
 * A tag's part of a URL: lowercase, spaces → "-" ("Life on Film" → "life-on-film").
 */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

/** The URL of a tag's page: /blog/tag/thoughts/. */
export function tagUrl(tag: string): string {
  return `/blog/tag/${tagSlug(tag)}/`;
}

/** "1 post", "6 posts". */
export function countPosts(n: number): string {
  return `${n} post${n === 1 ? '' : 's'}`;
}

export interface Tag {
  name: string;   // as written in the posts (the first spelling met, newest post first)
  slug: string;   // its part of the URL, from tagSlug()
  posts: Post[];  // the posts with this tag, in the order given (newest first)
}

/**
 * Every tag used by these posts, most-used first, then A–Z.
 * Tags that give the same slug ("Books" and "books") count as one tag.
 */
export function getTags(posts: Post[]): Tag[] {
  const tags = new Map<string, Tag>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      if (!tags.has(slug)) tags.set(slug, { name, slug, posts: [] });
      const tag = tags.get(slug)!;
      if (!tag.posts.includes(post)) tag.posts.push(post);   // a post listing a tag twice counts once
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name),
  );
}
