// Site-wide settings, in one place so pages and components don't repeat them.

export const SITE = {
  name: 'bimanjaya.',                        // same as the WordPress site title
  description: 'Personal website and blog of Bimanjaya.',
  lang: 'en',                                // default language; posts may be English or Indonesian
};

// Header navigation, in display order. The header numbers them from this order
// ("01 : Blog", "02 : About"), so adding an entry renumbers the rest by itself.
// There's no Home: "/" forwards to /blog/ (astro.config.mjs `redirects`).
export const NAV = [
  { label: 'Blog', href: '/blog/' },
  { label: 'Galleries', href: '/galleries/' },   // photo albums
  { label: 'About', href: '/about/' },
];

// Social links, shown as icons in the footer. `icon` picks the drawing in
// src/components/SocialLinks.astro; `label` is what screen readers say and the hover tooltip.
export const SOCIAL = [
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/bimanjayaaji/' },
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/bimanjaya-aji-94aa09331' },
  { label: 'Goodreads', icon: 'goodreads', href: 'https://www.goodreads.com/user/show/83237760-bimanjaya' },
];
