# Add a New Product to darbury.ai

Use this procedure to add a new product to the Work page. The whole site is
data-driven, so adding a product means creating **one file only**. No component,
route, or sitemap changes are ever needed.

## Step 1 — Ask Dave for the title

Ask for the **title of the card / page** and nothing else. Dave will complete
the copy, category, image & ordering later to ensure consistency.

## Step 2 — Create the mdx file

Create `content/projects/<slug>.mdx`, where `<slug>` is the title lowercased
with spaces replaced by hyphens (e.g. "P&ID Analyser" → `pid-analyser`).
The filename **is** the URL: the page appears at `/work/<slug>` and the card
links to it automatically.

Use this template exactly:

```mdx
---
title: <Title from Dave>
tagline: <One-line placeholder tagline — Dave will rewrite>
category: AI Tooling            # placeholder — reuse an existing category, never invent a new one
status: pre-release             # renders as a "Coming Soon" badge until Dave changes it
tech: [TBC]
order: <highest existing order + 1>
---

## Problem

Placeholder — Dave to complete.

## Approach

Placeholder — Dave to complete.

## Result

Placeholder — Dave to complete.
```

## Rules

1. **Order:** check `order:` in every existing file under `content/projects/`
   and set the new one to the highest value + 1. This puts the card at the
   bottom of the Work page. Dave will re-order later.
2. **Category:** must be one of the categories already in use (grep
   `category:` across `content/projects/`). A new category value creates a new
   filter chip on the Work page, so never invent one.
3. **Status:** must be one of `live | active | pre-release | concept |
   delivered | experimental`. Use `pre-release` for a new product.
4. **Image:** omit the `image:` field. The page then renders the standard
   `PlaceholderAsset` block. To add the card/hero image later, Dave drops the
   file at `darbury-ai/public/images/<slug>.jpg` and adds
   `image: /images/<slug>.jpg` (plus `imageFit: contain` if needed) to the
   frontmatter — that is the only plumbing needed.
   For adding an information PDF or videos to the page, follow
   `add-media-to-product.md`.
5. **Sections:** body content is split on `## ` headings by `lib/content.ts`.
   Keep the standard three sections (Problem / Approach / Result) with plain
   paragraphs only — no sub-headings, lists, or components inside sections.
6. **Optional fields** (leave out unless Dave asks): `featured: true` shows
   the card on the home page; `liveUrl:` adds a "Try it live" button on the
   project page.
7. **Do not touch** `app/work/page.tsx`, `app/work/[slug]/page.tsx`,
   `components/project/*`, or `app/sitemap.ts` — they all read from the mdx
   files automatically.
