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

## Write a post

1. Create `src/content/posts/<slug>.md`. The file name becomes the URL: `norwegian-fjord.md` → `/blog/norwegian-fjord/`. Lowercase, words joined with `-`.
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
   | `tags` | no | A list: `[travel, norway]` |
   | `lang` | no | `en` (default) or `id`: the post's main language. Mixing in the other language is fine. |
   | `draft` | no | `true` = visible in `npm run dev` only, left out of the built site |

   A wrong value (a misspelt field, `date: tomorrow`, `lang: fr`) stops the build with a message naming the file and the field.

### Photos

Put a post's photos in `src/assets/images/<slug>/` and refer to them with the `@images/` shortcut:

```markdown
![The ferry at dawn](@images/norwegian-fjord/ferry.jpg)
```

- The text in `[…]` describes the photo for people who can't see it (screen readers, slow connections). Always fill it in.
- Use full-size photos straight from the camera or phone. The build makes resized WebP versions (640–1920 px wide) and each reader's browser downloads the one that fits their screen.
- Photos are shown as wide as the text column. Markdown can't size an image, and an HTML `<img>` tag in a post is **not** optimised (and its path won't work), so stick to `![…](…)`.
- Don't put photos in `public/`: files there are served as-is, without resizing.

## The About page and the galleries

- **About:** the text (bio, book and show lists) is `src/content/pages/about.md`; edit it like a post. The photo is in `src/pages/about.astro`. The Instagram / LinkedIn / Goodreads links (footer icons) and the menu are in `src/config.ts` (`SOCIAL`, `NAV`).
- **Galleries:** `src/content/galleries/gallery.yaml` and `lof.yaml` list each gallery's photos in display order, with optional `caption` and `alt`. The photos are in `src/assets/galleries/<gallery|lof>/`. To add one, copy the photo in and add a `- image: ../../assets/galleries/lof/<file>` line where it should appear. A wrong file name stops the build. No page shows the galleries yet (planned).

## Layout

| Path | What's in it |
|---|---|
| `src/content/posts/` | The posts (Markdown) |
| `src/content/pages/` | Page text kept in Markdown (`about.md`) |
| `src/content/galleries/` | Gallery lists (`gallery.yaml`, `lof.yaml`) |
| `src/assets/images/` | Photos used in posts, one folder per post; `about/` for the About photo |
| `src/assets/galleries/` | Gallery photos, one folder per gallery |
| `src/pages/` | One file per page; the file path is the URL (`about.astro` → `/about/`). `blog/[slug].astro` builds one page per post. |
| `src/layouts/` | Page shells: `BaseLayout` (every page), `PostLayout` (posts) |
| `src/components/` | Header, Footer |
| `src/styles/global.css` | Design tokens (colours, fonts, spacing) and base styles |
| `src/config.ts` | Site name, description, nav links |
| `src/content.config.ts` | The rules for post frontmatter, page text and gallery lists |
| `src/plugins/` | A Markdown plugin that gives images their real display size |
| `public/` | Files copied as-is to the site root (favicon) |
| `astro.config.mjs` | Astro settings (image sizes, Markdown processing) |
| `scripts/wp-import/` | One-off scripts that imported the old WordPress site (from `wp-archive/`, not in git) |
| `dev/` | Development notes: features, stages, decisions. Start at [dev/README.md](dev/README.md) |
