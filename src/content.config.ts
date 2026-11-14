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

// Pages whose text is kept in Markdown, so it's edited like a post: src/content/pages/about.md.
// The page's layout (photo, links) stays in its .astro file in src/pages/ (decision 02/D7).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lang: z.enum(['en', 'id']).default('en'),
  }),
});

// Photo albums: one YAML file per album in src/content/galleries/ (gallery.yaml, lof.yaml),
// listing its photos in display order (decisions 02/D6, 05/D5). The file name is the album's
// name and address: lof.yaml → /galleries/lof/. image() checks each photo file exists and
// lets Astro optimise it; a wrong file name fails the build.
const galleries = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/galleries' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().int(),              // card order on /galleries/, smallest first (05/D4)
      description: z.string().optional(),   // a line on the card and under the album title
      cover: image().optional(),            // the card's photo; default: the first photo
      draft: z.boolean().default(false),    // true: visible in `npm run dev` only
      photos: z
        .array(
          z.object({
            image: image(),                 // path relative to the .yaml file
            caption: z.string().optional(), // the story: gives the photo a ¶ mark (05/D6)
            alt: z.string().default(''),    // what the photo shows, for screen readers
          }),
        )
        .min(1),
    }),
});

export const collections = { posts, pages, galleries };
