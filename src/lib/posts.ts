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
