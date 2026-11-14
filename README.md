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
| `npm run dev` | Dev server with live reload |
| `npm run build` | Build the finished site into `dist/` |
| `npm run preview` | Serve `dist/` locally, to check the build |

## Layout

| Path | What's in it |
|---|---|
| `src/pages/` | One file per page; the file path is the URL (`about.astro` → `/about/`) |
| `public/` | Files copied as-is to the site root (favicon, robots.txt) |
| `astro.config.mjs` | Astro settings |
| `dev/` | Development notes: features, stages, decisions. Start at [dev/README.md](dev/README.md) |
