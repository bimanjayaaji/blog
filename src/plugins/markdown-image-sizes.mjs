// Markdown plugin: tells Astro how big images in posts really are on screen.
//
// Why: a Markdown image (![alt](…)) can't carry size information, so Astro assumes
// it may fill the whole browser window. On a wide or high-density screen the browser
// then downloads a huge version, while the image is only ever shown inside the
// ~640px text column. This plugin adds two hints to every Markdown image, before
// Astro optimises it:
//   - sizes:  how wide the image is displayed, so the browser picks the right file
//   - widths: which versions to generate (no full-size copy of a 4000px photo)
// Astro skips any width larger than the original, so small images are never upscaled.
//
// Registered in astro.config.mjs (markdown.processor → satteri → hastPlugins).

/**
 * @param {{ sizes: string, widths: number[] }} options
 */
export function markdownImageSizes({ sizes, widths }) {
  return {
    name: 'markdown-image-sizes',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const props = node.properties ?? {};
        if (!('sizes' in props)) ctx.setProperty(node, 'sizes', sizes);
        if (!('widths' in props)) ctx.setProperty(node, 'widths', widths);
      },
    },
  };
}
