// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { markdownImageSizes } from './src/plugins/markdown-image-sizes.mjs';

// Image widths to generate. The text column is at most 640px; ×2 for high-density
// (retina) screens gives 1280. 1920 leaves room for wider images later.
const IMAGE_WIDTHS = [640, 960, 1280, 1920];

// https://astro.build/config
export default defineConfig({
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
    // Sätteri is Astro's default Markdown processor; it's named here only to add a plugin.
    processor: satteri({
      hastPlugins: [
        markdownImageSizes({
          // Images in posts sit in the text column: 40rem (640px) wide once the window
          // is wider than 42rem (the column plus its side padding), otherwise the window
          // width minus the 1rem padding on each side. Keep in sync with --measure / --gutter.
          sizes: '(min-width: 42rem) 40rem, calc(100vw - 2rem)',
          widths: IMAGE_WIDTHS,
        }),
      ],
    }),
  },
});
