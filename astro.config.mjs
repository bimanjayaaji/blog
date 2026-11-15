// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { markdownImageSizes } from './src/plugins/markdown-image-sizes.mjs';
import { markdownFigures } from './src/plugins/markdown-figures.mjs';
import { markdownExternalLinks } from './src/plugins/markdown-external-links.mjs';

// Image widths to generate. The text column is at most 736px (46rem); ×2 for
// high-density (retina) screens needs ~1472, covered by 1920. 1920 also leaves room
// for wide images (up to the 64rem frame).
const IMAGE_WIDTHS = [640, 960, 1280, 1920];

// https://astro.build/config
export default defineConfig({
  // No home page: the site opens on the blog list. In the built site Astro writes a
  // tiny dist/index.html that forwards straight to /blog/; a host like Cloudflare can turn
  // this into a real server redirect when the site is hosted.
  redirects: {
    '/': '/blog/',
  },

  // Fonts. Astro downloads the files from Fontsource while building and serves
  // them from this site (/_astro/fonts/…): readers never contact Google or Fontsource.
  // Each font becomes a CSS variable; global.css uses them in --font-body / --font-ui.
  // <Font> tags in BaseLayout.astro add the @font-face rules to every page.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Lora',                      // content: posts, About
      cssVariable: '--font-lora',
      weights: ['400 700'],              // a variable font: one file covers every weight in between
      styles: ['normal', 'italic'],
      subsets: ['latin'],                // English + Indonesian need nothing more
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Courier Prime',             // header, menu, dates: the old site's font
      cssVariable: '--font-courier-prime',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Courier New', 'monospace'],
    },
  ],

  image: {
    // Every optimised image gets several sizes (a srcset), so a phone downloads
    // a small file and a desktop a bigger one.
    // "constrained": scales down to fit its column, never up past its original size.
    layout: 'constrained',
    // Let Astro add the CSS that makes those images behave (scale, keep their aspect ratio).
    responsiveStyles: true,
    breakpoints: IMAGE_WIDTHS,
  },

  markdown: {
    // Code blocks: a light and a dark colour set. defaultColor: false writes both as
    // CSS variables (--shiki-light, --shiki-dark); global.css picks one per mode.
    // Changing this? Delete .astro/data-store.json (or node_modules/.astro): Astro caches
    // rendered posts and won't re-highlight them otherwise.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },

    // Sätteri is Astro's default Markdown processor; it's named here only to add a plugin.
    processor: satteri({
      // attributes: lets a post write {.small} / {.wide} after an image.
      features: { attributes: true },
      hastPlugins: [
        // Photos → <figure>: sizes, captions, side-by-side rows. See the file for the syntax.
        markdownFigures({ widths: IMAGE_WIDTHS }),
        // Any other image (e.g. inside a list): the column-width size hint.
        markdownImageSizes({
          // Images in posts sit in the text column: 46rem (736px) wide once the window
          // is wider than 48rem (the column plus its side padding), otherwise the window
          // width minus the 1rem padding on each side. Keep in sync with --width-text / --gutter.
          sizes: '(min-width: 48rem) 46rem, calc(100vw - 2rem)',
          widths: IMAGE_WIDTHS,
        }),
        // Links to other websites open in a new tab: on the About page only (its book/show lists).
        markdownExternalLinks({ folders: ['src/content/pages/'] }),
      ],
    }),
  },
});
