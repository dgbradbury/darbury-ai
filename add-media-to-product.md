# Add Media to a Product Page on darbury.ai

Use this procedure to add an information PDF and/or reference videos to any
existing product page. The mechanism is already built into the site — adding
media to a product means copying the file(s) into place and adding one or two
frontmatter lines to that product's mdx file. Products without these fields
are unaffected, so media can be added one product at a time.

## Quick reference — where Dave drops the files

For a product whose page is `/work/<slug>` (mdx file `content/projects/<slug>.mdx`):

1. **Info PDF** → drop it at `darbury-ai/public/pdfs/<slug>.pdf`
   (exactly one pdf per product, named after the slug).
2. **Videos** → drop mp4s into `darbury-ai/public/videos/<slug>/`
   (create the folder if it doesn't exist, filenames lowercase-with-hyphens,
   e.g. `quick-tour.mp4`).

Dropping the files alone does **nothing** on the site. The only plumbing
needed is the frontmatter in that product's mdx file (Step 3 below) — once
those lines are added, the button and players appear automatically. No code,
component, or config changes, no restart, nothing else.

## Where the media lives

| Media type | Location in repo                          | Served at                    |
|------------|-------------------------------------------|------------------------------|
| Info PDF   | `public/pdfs/<slug>.pdf`                  | `/pdfs/<slug>.pdf`           |
| Videos     | `public/videos/<slug>/<video-name>.mp4`   | `/videos/<slug>/<name>.mp4`  |

`<slug>` is the product's mdx filename (e.g. `plantmcp`). Source PDFs are
authored in `AI Portfolio/InformationSheets/<slug>/` — copy the finished pdf
from there into `public/pdfs/`.

## Step 1 — Ask Dave which product and which media

Ask for the product (slug or title) and whether this is a PDF, one or more
videos, or both. For each video, ask for a short display title.

## Step 2 — Copy the files into place

PDF: copy to `public/pdfs/<slug>.pdf`.
Videos: create `public/videos/<slug>/` and copy each mp4 in, filenames
lowercase with hyphens (e.g. `quick-tour.mp4`).

## Step 3 — Add the frontmatter to `content/projects/<slug>.mdx`

Add only the fields being used:

```yaml
pdf: /pdfs/<slug>.pdf
videos:
  - title: Quick Tour
    src: /videos/<slug>/quick-tour.mp4
  - title: Early Demonstration
    src: /videos/<slug>/early-demo.mp4
```

## Adding more media to a page that already has some

The recommended workflow is media first, plumbing second: drop the new file
into the same locations as above, then edit the frontmatter. For an extra
video, append one more `- title:` / `src:` entry to the existing `videos:`
list — existing entries stay untouched. Videos render in the order listed,
so reorder the list entries to reorder the page. Replacing the PDF is just
overwriting `public/pdfs/<slug>.pdf` (the frontmatter line stays the same).
It is the same one-file edit whether it is the first video or the fifth.

## What renders

- **`pdf:`** an "Information Sheet (PDF)" outline button in the page hero,
  under the tagline. Opens the PDF in a new browser tab using the browser's
  built-in viewer (viewable & downloadable).
- **`videos:`** a "Videos" section between the numbered content sections and
  the Tech Stack, one titled native HTML5 player per entry, in the order
  listed. Single video or multiple both work.

## Rules

1. **Do not touch** `app/work/[slug]/page.tsx` or `lib/content.ts` — the
   rendering is already in place and driven entirely by the frontmatter.
2. Paths in frontmatter start with `/pdfs/` or `/videos/` (no `public/`
   prefix) and must match the copied filenames exactly (case-sensitive on
   Vercel).
3. Videos are mp4 (H.264/AAC) for universal browser support. Keep files as
   small as reasonable — they are served from the repo via Vercel, so very
   large videos will bloat the git repo. If a video exceeds ~50 MB, flag it
   to Dave before committing and consider compressing it first.
4. Omitting a field (or the whole block) simply hides that feature on the
   page — safe on every product.
5. **Before any GitHub sync**, list the files added under `public/pdfs/` and
   `public/videos/` and the mdx files changed, and get Dave's confirmation.
