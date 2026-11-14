// Markdown plugin: photos with sizes, captions and side-by-side rows (03/D6, BACKLOG B2).
//
// In Markdown a photo sits in a paragraph (<p>). This plugin looks at every paragraph
// that holds only photos (plus, optionally, one italic line at the end) and turns it
// into a <figure>:
//
//   ![alt](@images/post/a.jpg)              → one photo, column width
//
//   ![alt](@images/post/a.jpg){.small}      → half the column, centred
//   ![alt](@images/post/a.jpg){.wide}       → wider than the text (up to the frame)
//
//   ![alt](@images/post/a.jpg)              → photo + caption: an italic line directly
//   *foto dari [someone](https://…)*          under the photo, NO blank line between
//
//   ![alt](@images/post/a.jpg)              → side by side: image lines directly under
//   ![alt](@images/post/b.jpg)                each other, NO blank line (stacked on phones)
//
// With a blank line in between, Markdown makes separate paragraphs: separate figures
// and an ordinary italic paragraph, as before.
//
// It also gives each photo the right `sizes` hint (how wide it is on screen, so the
// browser downloads a fitting file) and `widths` (which files Astro generates).
// The rem values below must match --width-text, --width-frame and --gutter in
// src/styles/global.css, and the figure CSS there.
//
// Registered in astro.config.mjs, before markdownImageSizes (which then leaves these
// photos alone, because they already have `sizes`). After changing this file, run
// `npm run clean`: Astro caches rendered posts.

const SIZES = {
  normal: '(min-width: 48rem) 46rem, calc(100vw - 2rem)',
  small: '(min-width: 25rem) 23rem, calc(100vw - 2rem)',
  wide: '(min-width: 66rem) 64rem, (min-width: 48rem) 46rem, calc(100vw - 2rem)',
};

// A row of n photos: each gets 1/n of the column (or of the frame, for a wide row);
// below 40rem the row stacks, so each photo is full width again.
const rowSizes = (n, wide) =>
  [
    wide ? `(min-width: 66rem) calc(64rem / ${n})` : null,
    `(min-width: 48rem) calc(46rem / ${n})`,
    `(min-width: 40rem) calc((100vw - 2rem) / ${n})`,
    'calc(100vw - 2rem)',
  ]
    .filter(Boolean)
    .join(', ');

const isElement = (node, tag) => node.type === 'element' && node.tagName === tag;
const isBlank = (node) => node.type === 'text' && node.value.trim() === '';

// The classes written as {.small} / {.wide} on an image.
function classesOf(img) {
  const raw = img.properties?.className ?? img.properties?.class ?? [];
  return Array.isArray(raw) ? raw.map(String) : String(raw).split(/\s+/).filter(Boolean);
}

/** @param {{ widths: number[] }} options */
export function markdownFigures({ widths }) {
  return {
    name: 'markdown-figures',
    element: {
      filter: ['p'],
      visit(node, ctx) {
        // Split the paragraph into photos and an optional trailing italic caption.
        const parts = node.children.filter((c) => !isBlank(c));
        const imgs = [];
        let caption = null;
        for (const [i, child] of parts.entries()) {
          if (isElement(child, 'img') && !caption) imgs.push(child);
          else if (isElement(child, 'em') && imgs.length > 0 && i === parts.length - 1) caption = child;
          else return;   // any other text: an ordinary paragraph, leave it alone
        }
        if (imgs.length === 0) return;

        const classes = new Set(imgs.flatMap(classesOf));
        const wide = classes.has('wide');
        const small = !wide && imgs.length === 1 && classes.has('small');
        const sizes =
          imgs.length > 1 ? rowSizes(imgs.length, wide) : wide ? SIZES.wide : small ? SIZES.small : SIZES.normal;

        const figureClasses = ['figure'];
        if (imgs.length > 1) figureClasses.push('row');
        if (wide) figureClasses.push('wide');
        if (small) figureClasses.push('small');

        // Copies of the photos without their own class (it moves to the figure), with size hints.
        const photos = imgs.map((img) => {
          const { className, class: _class, ...props } = img.properties ?? {};
          return { ...img, properties: { ...props, sizes, widths } };
        });

        const children = [...photos];
        if (caption) {
          children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: caption.children });
        }

        ctx.replaceNode(node, {
          type: 'element',
          tagName: 'figure',
          properties: { className: figureClasses },
          children,
        });
      },
    },
  };
}
