# ronakjethwa.photos

Ronak's personal photo gallery. It's built with Eleventy 3, Nunjucks and Sass, and deployed on Netlify. The project started from the `eleventy-photo-gallery` starter, so `README.md` and `CONTRIBUTING.md` still describe the upstream template (Pexels credits, `_data/gallery.json` examples). Trust this file and the code over them.

## Commands

- `npm run dev`: builds Sass once, then watches Sass and Eleventy with a local server.
- `npm run build`: the full pipeline, below. It's what Netlify runs.
- `npm run check:a11y`: the static accessibility and metadata check over `_site/`.
- `npm run lint:js`, `npm run lint:css`
- Node 22 (`.nvmrc`).

The build pipeline:
- `prebuild` runs `scripts/image-cache-guard.js`. It prunes cached variants whose source photo changed.
- `build` compiles Sass to `src/_includes/css`, then runs Eleventy into `_site/`.
- `postbuild` records the image manifest and runs `scripts/a11y-check.js`. A11y failures fail the build.

A cold build regenerates every image variant and takes about 280s. A warm build takes about 3s. Expect a slow first build.

## Layout

- `src/_data/gallery.json`: the photo list (44 entries). Fields: `title`, `notes` (Ronak's own caption, written in first person), `date`, `credit`, `src`, `alt`, `imgDir`, `width`, `height`.
- `src/images/`: full-size originals. They are inputs only and never ship.
- `src/templates/{gallery,feature}.njk`: the gallery pages and the per-photo feature pages.
- `src/_includes/`: layouts (`base`, `main`, `meta`, `nav`, `footer`), the gallery partials, `sass/` (source) and `css/` (generated).
- `.eleventy.js`: the `respimg` shortcode, the `variant` filter (og:image), and the `cssmin` filter.

## Images

- `respimg` writes AVIF, WebP and JPEG variants straight into `_site/images/` at widths `[320, 480, 640, 768, 1024]`. JPEG and WebP use quality 78 and AVIF uses 55. Quality is tuned per format on purpose, so don't unify it.
- Filenames are `<name>-<width>.<format>`, not content-hashed, so URLs stay stable.
  - Replacing a photo under the same filename relies on `image-cache-guard.js` to drop the stale variants.
  - Never bypass the guard or rename the format scheme.
- eleventy-img never upscales, so `width` and `height` in `gallery.json` must be the original's real dimensions.
- Adding a photo: put the original in `src/images/`, add an entry to `gallery.json`, and write real `alt` text (the a11y check enforces it).

## Netlify (`netlify.toml`)

- `_site/images` is persisted between deploys with `netlify-plugin-cache`. That cache is why builds are fast.
- The CSP is strict: `script-src 'self' https://www.googletagmanager.com`. Inline scripts are blocked, so new JS goes in a file under `src/js/`. If a new origin is needed, update the CSP in the same change.
- Renaming a photo title changes its URL. Add a 301 in `netlify.toml`, following the existing redirects.
- HTML is served with `must-revalidate`. Images are `immutable`.

## Workflow

- Make changes on a branch and open a PR (the history is `#NN` merge commits). Pushing to `main` deploys to production.
- After any change to templates, data or images, run `npm run build` and confirm the a11y check passes.
- `CHANGELOG.md` stopped being maintained in April 2025, and PR descriptions are the record now. Don't add entries unless asked.
