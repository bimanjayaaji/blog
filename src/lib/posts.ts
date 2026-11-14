// Helpers for working with posts, shared by the blog list and the post pages.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * All posts that should appear on the site, newest first.
 * Drafts are included while developing (`npm run dev`) and left out of the real build.
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (post) => import.meta.env.DEV || !post.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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

/** "9 Nov": the date without its year, for lists grouped by year (04/D1). UTC, like formatDate. */
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

/** The URL of a year's page: /blog/2025/ (04/D4; the page itself comes in S3). */
export function yearUrl(year: number): string {
  return `/blog/${year}/`;
}

/**
 * A tag's part of a URL: lowercase, spaces → "-" ("Life on Film" → "life-on-film").
 * Proposed rule, 04/D3; the four current tags are already in this form.
 */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

/** The URL of a tag's page: /blog/tag/thoughts/ (04/D3; the page itself comes in S2). */
export function tagUrl(tag: string): string {
  return `/blog/tag/${tagSlug(tag)}/`;
}

/** "1 post", "6 posts". */
export function countPosts(n: number): string {
  return `${n} post${n === 1 ? '' : 's'}`;
}
