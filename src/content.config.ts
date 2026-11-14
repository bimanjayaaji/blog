// Content collections: groups of Markdown files that Astro loads, checks and types.
// For now there's one collection, `posts`. The schema is the D5 frontmatter:
// if a post's frontmatter doesn't match it, the build stops and names the file and field.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // Every .md file under src/content/posts/ is a post. Its file name (minus .md) is its id,
  // which becomes the URL: src/content/posts/hello-world.md → /blog/hello-world/
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),

  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),                       // write it as YYYY-MM-DD
    description: z.string().optional(),          // falls back to the site description
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),           // true: visible in `npm run dev` only
    lang: z.enum(['en', 'id']).default('en'),    // the post's main language
  }),
});

export const collections = { posts };
