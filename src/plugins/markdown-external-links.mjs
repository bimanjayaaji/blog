// Markdown plugin: links to other websites open in a new tab, in chosen Markdown files only.
//
// Used for the About page (src/content/pages/), whose book and show lists link out to
// Goodreads, IMDb, Netflix…: a reader clicking one keeps the About page open.
// Links inside the site (/blog/…) and links in posts are left as they are.
//
// Each outside link gets:
//   target="_blank"  open in a new tab
//   rel="noopener"   the new tab can't control this one (a safety default)
// It runs when the site is built: no JavaScript in the page. Write links as usual: [title](url).
//
// Registered in astro.config.mjs (markdown.processor → satteri → hastPlugins).
// After changing which files it applies to: `npm run clean`, then rebuild (Astro caches pages).

import { fileURLToPath } from 'node:url';

/**
 * @param {{ folders: string[] }} options  folders (relative to the project) whose files it applies to,
 *                                         e.g. ['src/content/pages/']
 */
export function markdownExternalLinks({ folders }) {
  return {
    name: 'markdown-external-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        if (!ctx.fileURL) return;
        const path = fileURLToPath(ctx.fileURL).replaceAll('\\', '/');
        if (!folders.some((folder) => path.includes(`/${folder}`))) return;

        const href = String(node.properties?.href ?? '');
        if (!/^https?:\/\//.test(href)) return;   // only links to other websites

        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', 'noopener');
      },
    },
  };
}
