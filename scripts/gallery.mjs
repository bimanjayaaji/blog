#!/usr/bin/env node
/*
 * npm run gallery <name>
 *
 * Creates or extends a photo album's list (decision 05/D9):
 *   photos:  src/assets/galleries/<name>/      (you put them there)
 *   list:    src/content/galleries/<name>.yaml (this script writes it)
 *
 * - No list yet: creates it with a title (from the name), the next free `order`, and every
 *   photo in the folder, sorted by file name.
 * - List exists: adds the photos that aren't listed yet at the end, sorted by file name.
 *   Lines already in the list are never changed or reordered; comments stay.
 * - Warns about listed photos whose file is missing, and about very large files (05/D10).
 *
 * Plain Node, no packages to install. Changes nothing but the one .yaml file.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, openSync, readSync, closeSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS_DIR = join(ROOT, 'src/assets/galleries');
const LISTS_DIR = join(ROOT, 'src/content/galleries');
const PHOTO_TYPES = /\.(jpe?g|png|webp|avif)$/i;
const BIG_BYTES = 2 * 1024 * 1024;   // warn above ~2 MB…
const BIG_PIXELS = 3000;             // …or above 3000 px on the long side (05/D10)

const fail = (message) => {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
};

// ---------- 1. Which album ----------
const name = process.argv[2];
if (!name) fail('Which album? Usage: npm run gallery <name>   e.g. npm run gallery jogja-2026');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  fail(`"${name}" can't be an album name: it becomes the address /galleries/${name}/.\n  Use only lowercase letters, digits and "-", e.g. "jogja-2026".`);
}

const folder = join(PHOTOS_DIR, name);
const listFile = join(LISTS_DIR, `${name}.yaml`);
const show = (path) => relative(ROOT, path);

if (!existsSync(folder)) {
  fail(`There's no photo folder ${show(folder)}/ yet.\n  Make it, put the album's photos in it, then run this again.`);
}

const photosInFolder = readdirSync(folder)
  .filter((file) => PHOTO_TYPES.test(file) && statSync(join(folder, file)).isFile())
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));   // IMG_2 before IMG_10

if (photosInFolder.length === 0) {
  fail(`${show(folder)}/ has no photos (.jpg, .jpeg, .png, .webp or .avif).`);
}

// How a photo is written in the list: a path relative to the .yaml file. Names with
// unusual characters are put in quotes so YAML reads them as plain text.
const photoLine = (file) => {
  const path = `../../assets/galleries/${name}/${file}`;
  return `  - image: ${/^[\w./-]+$/.test(path) ? path : JSON.stringify(path)}`;
};

// ---------- 2. New list, or add to the existing one ----------
let added;

if (!existsSync(listFile)) {
  // The next free `order`: one more than the highest in the other lists.
  const orders = readdirSync(LISTS_DIR)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => readFileSync(join(LISTS_DIR, file), 'utf8').match(/^order:\s*(-?\d+)/m))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const order = orders.length ? Math.max(...orders) + 1 : 1;

  // "jogja-2026" → "Jogja 2026": a starting title, to edit.
  const title = name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

  const text = [
    `# ${title}: photos in display order. Move lines to reorder.`,
    `# Each photo: image (required), caption (optional: the story, gives a ¶ mark), alt (optional:`,
    `# what the photo shows, for screen readers).`,
    `# order: where the album's card sits on /galleries/ (smallest first).`,
    `# Optional: description: "…" (a line on the card), cover: <a photo path> (the card's photo;`,
    `# default: the first), draft: true (visible in npm run dev only).`,
    `title: ${JSON.stringify(title)}`,
    `order: ${order}`,
    `photos:`,
    ...photosInFolder.map(photoLine),
    '',
  ].join('\n');
  writeFileSync(listFile, text);
  added = photosInFolder;
  console.log(`\n✓ Made ${show(listFile)} with ${added.length} photo${added.length === 1 ? '' : 's'}.`);
  console.log(`  Title "${title}", order ${order}: edit them in the file.`);
} else {
  const text = readFileSync(listFile, 'utf8');
  const lines = text.split('\n');

  // New photos go at the end of the file, so `photos:` must be the last field.
  const photosAt = lines.findIndex((line) => /^photos:/.test(line));
  if (photosAt === -1) fail(`${show(listFile)} has no "photos:" line.`);
  const fieldAfter = lines.slice(photosAt + 1).find((line) => /^[A-Za-z_]/.test(line));
  if (fieldAfter) {
    fail(`In ${show(listFile)}, "photos:" must be the last field (found "${fieldAfter}" after it).\n  Move that line above "photos:" and run this again.`);
  }

  // Photos already listed (any album's folder), as full paths.
  const listed = [...text.matchAll(/^\s*-\s*image:\s*["']?(.+?)["']?\s*$/gm)].map((match) =>
    resolve(LISTS_DIR, match[1]),
  );

  const missing = listed.filter((path) => !existsSync(path));
  for (const path of missing) console.warn(`\n! Listed but not found: ${show(path)}\n  (the build will stop until you fix or remove that line)`);

  added = photosInFolder.filter((file) => !listed.includes(join(folder, file)));
  if (added.length === 0) {
    console.log(`\n✓ Nothing to add: every photo in ${show(folder)}/ is already in ${show(listFile)}.`);
  } else {
    const ending = text.endsWith('\n') ? '' : '\n';
    // An empty list may be written "photos: []": open it up first.
    const base = text.replace(/^photos:\s*\[\]\s*$/m, 'photos:');
    writeFileSync(listFile, base + ending + added.map(photoLine).join('\n') + '\n');
    console.log(`\n✓ Added ${added.length} photo${added.length === 1 ? '' : 's'} at the end of ${show(listFile)}:`);
    for (const file of added) console.log(`    ${file}`);
  }
}

// ---------- 3. Size check (05/D10) ----------
// Visitors never download these files (the site makes small versions), but git keeps
// every photo forever, so very large ones make the repo heavy.
for (const file of added) {
  const path = join(folder, file);
  const bytes = statSync(path).size;
  const size = imageSize(path);
  const longSide = size ? Math.max(size.width, size.height) : 0;
  if (bytes > BIG_BYTES || longSide > BIG_PIXELS) {
    const mb = (bytes / 1024 / 1024).toFixed(1);
    console.warn(`! ${file} is big (${mb} MB${size ? `, ${size.width} × ${size.height}` : ''}). Fine for visitors; to keep the repo light, export at ~2400 px on the long side.`);
  }
}

console.log(`\nNext: reorder lines, add caption:/alt: if you like, then npm run dev → /galleries/${name}/\n`);

// ---------- Helpers ----------

/** Width and height from a JPEG, PNG or WebP file's first bytes; null if unknown (e.g. AVIF). */
function imageSize(path) {
  const fd = openSync(path, 'r');
  const buf = Buffer.alloc(256 * 1024);
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const b = buf.subarray(0, n);

  // PNG: the IHDR chunk right after the 8-byte signature.
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };

  // WebP: RIFF....WEBP, then a VP8 / VP8L / VP8X chunk.
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }

  // JPEG: walk the markers to the "start of frame" one, which holds the size.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}
