// Helpers for the photo albums, shared by /galleries/ and the album pages.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Album = CollectionEntry<'galleries'>;
export type Photo = Album['data']['photos'][number];

/**
 * All albums that should appear on the site, in card order: `order` smallest first,
 * then by title when two albums share a number.
 * Drafts are included while developing (`npm run dev`) and left out of the real build.
 */
export async function getAlbums(): Promise<Album[]> {
  const albums = await getCollection('galleries', (album) => import.meta.env.DEV || !album.data.draft);
  for (const album of albums) checkAlbumName(album);
  return albums.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/**
 * The file name becomes the address (/galleries/<name>/), so it may only use
 * lowercase letters, digits and "-". Anything else stops the build with a message.
 */
function checkAlbumName(album: Album): void {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(album.id)) {
    throw new Error(
      `The album file "${album.filePath ?? album.id}" has a name that can't be an address. ` +
        `Use only lowercase letters, digits and "-", e.g. "jogja-2026.yaml".`,
    );
  }
}

/** The URL of an album's page: /galleries/lof/. */
export function albumUrl(album: Album): string {
  return `/galleries/${album.id}/`;
}

/** The album's card photo: `cover` if set, otherwise the first photo. */
export function coverOf(album: Album) {
  return album.data.cover ?? album.data.photos[0].image;
}

/** "20 photos", or "23 photos · 8 with a story" when some have a caption. */
export function describePhotos(album: Album): string {
  const n = album.data.photos.length;
  const stories = album.data.photos.filter((p) => p.caption).length;
  const photos = `${n} photo${n === 1 ? '' : 's'}`;
  return stories ? `${photos} · ${stories} with a story` : photos;
}
