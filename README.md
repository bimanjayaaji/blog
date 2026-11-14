# blog

The source of bimanjayaaji.com: a static site built with [Astro](https://docs.astro.build). Posts are Markdown files; Astro turns them into plain HTML at build time.

## Run it

Needs Node 24 (pinned in `.nvmrc`). With nvm:

```sh
nvm use          # switch this terminal to the repo's Node version
npm install      # first time only, or after package.json changes
npm run dev      # dev server at http://localhost:4321, reloads on save
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload. Shows drafts. |
| `npm run build` | Build the finished site into `dist/`. Leaves drafts out. |
| `npm run preview` | Serve `dist/` locally, to check the build before publishing |
| `npm run clean` | Delete Astro's cache of rendered posts (after changing Markdown settings or plugins) |
| `npm run gallery <name>` | Create or extend a photo album's list from its folder (see [Galleries](#galleries)) |

## Write a post

1. Create `src/content/posts/<slug>.md`. The file name becomes the URL: `norwegian-fjord.md` → `/blog/norwegian-fjord/`. Lowercase, words joined with `-`. Two kinds of name are taken: a bare year (`2025.md`) and `tag.md`, because `/blog/2025/` and `/blog/tag/` are other pages. The build stops and says so if you use one.
2. Start it with frontmatter, then write the post in Markdown:

   ```markdown
   ---
   title: Norwegian Fjord
   date: 2025-11-02
   description: One line for the post list and link previews.
   tags: [travel, norway]
   lang: en
   draft: false
   ---

   The post starts here.
   ```

   | Field | Required | Notes |
   |---|---|---|
   | `title` | yes | |
   | `date` | yes | `YYYY-MM-DD` |
   | `description` | no | Falls back to the site description |
   | `tags` | no | A list: `[travel, norway]`. Each tag gets its own page (see below). |
   | `lang` | no | `en` (default) or `id`: the post's main language. Mixing in the other language is fine. |
   | `draft` | no | `true` = visible in `npm run dev` only, left out of the built site |

   A wrong value (a misspelt field, `date: tomorrow`, `lang: fr`) stops the build with a message naming the file and the field.

### Tags and years

The blog organises itself from the posts' `date` and `tags`; there's nothing to update by hand.

| Page | Address | Shows |
|---|---|---|
| Blog | `/blog/` | Every post, grouped by year, newest first, with its tags |
| A year | `/blog/2025/` | That year's posts; links to the years before and after (years without posts are skipped) |
| A tag | `/blog/tag/thoughts/` | The posts with that tag, grouped by year |
| All tags | `/blog/tag/` | Every tag with its number of posts, most used first |

- A tag's address is the tag in lowercase with spaces turned into `-`: `Life on Film` → `/blog/tag/life-on-film/`. The page still shows it as written. `Books` and `books` count as the same tag.
- A new tag or a new year gets its page on the next build. A tag or year used only by drafts shows up in `npm run dev` only.

### Photos

Put a post's photos in `src/assets/images/<slug>/` and refer to them with the `@images/` shortcut:

```markdown
![The ferry at dawn](@images/norwegian-fjord/ferry.jpg)
```

- The text in `[…]` describes the photo for people who can't see it (screen readers, slow connections). Always fill it in.
- Use full-size photos straight from the camera or phone. The build makes resized WebP versions (640–1920 px wide) and each reader's browser downloads the one that fits their screen.
- Photos are shown as wide as the text column, and never taller than 80% of the screen (tall portraits shrink and are centred). An HTML `<img>` tag in a post is **not** optimised (and its path won't work), so stick to `![…](…)`.
- **Sizes:** add `{.small}` (at most half the column, centred: screenshots, small images) or `{.wide}` (wider than the text, on big screens) right after the image:
  ```markdown
  ![chat from a friend](@images/persami/chat.jpg){.small}
  ![the mountain](@images/persami/andong.jpg){.wide}
  ```
- **Caption:** an italic line *directly* under the photo, with no blank line between. Links work in it:
  ```markdown
  ![sunrise](@images/persami/sunrise.jpg)
  *photo by [@someone](https://x.com/someone)*
  ```
- **Side by side:** image lines directly under each other, no blank line (2 or 3 photos; they stack on phones). A caption line can follow; `{.wide}` on any of them makes the whole row wide.
  ```markdown
  ![pos 1](@images/persami/pos-1.jpg)
  ![the top](@images/persami/top.jpg)
  ```
- A blank line between two images (or an image and an italic line) keeps them separate, as before.
- After changing anything in `astro.config.mjs` or `src/plugins/` (not needed for posts): `npm run clean`, then restart `npm run dev` / rebuild. Astro caches rendered posts and wouldn't notice.
- Don't put photos in `public/`: files there are served as-is, without resizing.

## The About page

The text (bio, book and show lists) is `src/content/pages/about.md`; edit it like a post. The photo is in `src/pages/about.astro`. The Instagram / LinkedIn / Goodreads links (footer icons) and the menu are in `src/config.ts` (`SOCIAL`, `NAV`).

## Galleries

"02 : Galleries" opens `/galleries/`: one card per album. Each album has its own page, `/galleries/<name>/`: its photos in rows (left to right, nothing cropped), a full-screen view on click, and a **¶ story** mark on photos with a caption.

An album is **one folder of photos + one list file**, with the same name:

```
src/assets/galleries/jogja-2026/     ← the photos
src/content/galleries/jogja-2026.yaml  ← the list: title, order, photos in display order
```

The name becomes the address, so only lowercase letters, digits and `-`. (`jogja-2026` is just an example.)

A list file:

```yaml
title: "A Weekend in Jogja"
order: 3                       # the card's place on /galleries/, smallest first
description: "Two days, one roll of film."    # optional: a line on the card and the album page
cover: ../../assets/galleries/jogja-2026/tugu.jpg   # optional: the card's photo (default: the first)
draft: true                    # optional: shown in `npm run dev` only, until you remove it
photos:                        # keep this the last field (the helper adds photos at the end)
  - image: ../../assets/galleries/jogja-2026/tugu.jpg
  - image: ../../assets/galleries/jogja-2026/malioboro.jpg
    caption: "the story behind it (gives the photo a ¶ story mark)"
    alt: "A busy street at dusk"   # what the photo shows, for screen readers
```

| I want to… | Do this |
|---|---|
| Make a new album | Make the folder `src/assets/galleries/<name>/`, put the photos in, run `npm run gallery <name>`. It writes the list with every photo (by file name), a title from the name and the next free `order`. Edit the title. |
| Add photos | Put them in the album's folder, run `npm run gallery <name>` again. New ones are added at the end; nothing already listed changes. |
| Reorder photos | Move lines in the `.yaml` (an `- image:` line together with its `caption:`/`alt:` lines). |
| Tell a photo's story | Add `caption: "…"` under it. |
| Remove a photo | Delete its lines, and the file. |
| Change the cover or the card order | `cover:` / `order:` (gaps are fine: 10, 20, 30 leaves room). |
| Hide an album while working on it | `draft: true` |
| Delete an album | Delete its folder and its `.yaml`. |

- **Photo size:** any size works for visitors: the build makes small AVIF/WebP versions and the full-screen view uses one at most 1600 px wide. Big originals only make the repo heavier (git keeps every photo forever), so export at **about 2400 px on the long side** before adding. The helper warns above ~3000 px or ~2 MB; it never changes your files.
- **Mistakes the build catches:** a photo path that doesn't exist, a missing `title` or `order`, an album name that can't be an address. It stops and names the file. The helper also warns about listed photos that are missing.
- **The first build after adding photos** takes a while (it makes all the sizes, ~1 s per photo); later builds reuse them.
- **The layout** is the same for every album, in `src/components/PhotoRows.astro` (rows) and `PhotoViewer.astro` (full-screen view).

## The look

- **Fonts:** Lora for text, Courier Prime for the name, menu and dates. Set in `astro.config.mjs` (`fonts`); Astro downloads them when building and serves them from the site itself.
- **Colours, sizes, widths:** the tokens at the top of `src/styles/global.css`. Each colour is written `light-dark(<light>, <dark>)`; the accent is the old site's teal `#007392` (`#56b6d0` in dark mode).
- **Dark mode:** follows the reader's system until they click the sun/moon; their choice is remembered in their browser.
- **Menu:** `NAV` in `src/config.ts`. The numbers ("01 : Blog") come from the order, so a new entry renumbers itself.
- **Favicon:** `public/favicon.svg` and `favicon.ico`. After replacing them, bump `?v=` in `src/layouts/BaseLayout.astro` (browsers cache icons hard).

## Layout

| Path | What's in it |
|---|---|
| `src/content/posts/` | The posts (Markdown) |
| `src/content/pages/` | Page text kept in Markdown (`about.md`) |
| `src/content/galleries/` | Album lists, one `.yaml` per album (`gallery.yaml`, `lof.yaml`) |
| `src/assets/images/` | Photos used in posts, one folder per post; `about/` for the About photo |
| `src/assets/galleries/` | Album photos, one folder per album |
| `src/pages/` | One file per page; the file path is the URL (`about.astro` → `/about/`). `blog/[slug].astro` builds one page per post, `blog/[year].astro` one per year, `blog/tag/[tag].astro` one per tag; `blog/tag/index.astro` is the tag list. `galleries/index.astro` is the album cards, `galleries/[album].astro` one page per album. |
| `src/layouts/` | Page shells: `BaseLayout` (every page), `PostLayout` (posts) |
| `src/components/` | Header (numbered menu), ThemeToggle (sun/moon), Footer, SocialLinks (icons), PostList (the year-grouped list on the blog, tag and year pages), PhotoRows (an album's photos), PhotoViewer (the full-screen view) |
| `src/styles/global.css` | Design tokens (colours light + dark, fonts, sizes, widths), base styles, photo figures, list-page headings |
| `src/lib/posts.ts` | Helpers for posts: the post list (drafts in dev only), dates, years, tags and their addresses |
| `src/lib/galleries.ts` | Helpers for albums: the album list in `order` (drafts in dev only), addresses, covers, photo counts |
| `src/config.ts` | Site name, description, menu (`NAV`), social links (`SOCIAL`) |
| `src/content.config.ts` | The rules for post frontmatter, page text and gallery lists |
| `src/plugins/` | Markdown plugins: photos → figures (sizes, captions, rows); image size hints |
| `public/` | Files copied as-is to the site root (favicon: "b." on teal) |
| `astro.config.mjs` | Astro settings: fonts, `/` → `/blog/`, image sizes, code colours, Markdown processing |
| `scripts/gallery.mjs` | `npm run gallery <name>`: creates or extends an album's list |
