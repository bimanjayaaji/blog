// Site-wide settings, in one place so pages and components don't repeat them.

export const SITE = {
  name: 'bimanjaya.',                        // same as the WordPress site title
  description: 'Personal website and blog of Bimanjaya.',
  lang: 'en',                                // default language; posts may be English or Indonesian
};

// Header navigation, in display order.
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
];
