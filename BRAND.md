# Darbury Brand Reference

> Source: Darbury Design System v1.0 — April 2026
> This file is a Claude context document. When building any Darbury website, apply every
> rule here exactly. Do not substitute, approximate, or invent brand values.

---

## Identity at a Glance

**Company:** Darbury Ltd
**Owner:** Dave Bradbury — Managing Director & Owner
**Founded:** 2000 · Based in Essex, UK
**Product:** iSiteData — AR platform for industrial site asset information management
**Tagline territory:** Vision, insight, seeing beyond the surface

---

## Logo & Mark

The Darbury mark is the **Eye of Ra (Wadjet)** symbol paired with the **"Darbury" wordmark**.
These two elements are always used together — never the eye mark in isolation.

### Usage rules

- Always maintain clear space equal to the height of the eye mark on all sides
- Use CSS `mix-blend-mode: multiply` on light surfaces; `filter: invert(1)` on dark surfaces
- Never add a box, container, or background behind the logo
- Never recolour, stretch, rotate, or add effects to the mark
- Never replace the wordmark with alternative text (e.g. "DB" initials)
- Use the black logo (with blend modes) on all backgrounds — do not create new colour variants

### Approved logo variants

| Variant       | Background        |
|---------------|-------------------|
| Black mark    | White             |
| Black mark    | Light Grey        |
| White mark    | Teal `#189B93`    |
| White mark    | Dark Teal `#334B49` |
| White mark    | Ink `#191D23`     |
| With URL      | White (footer use)|

### iSiteData logo

iSiteData has its own logotype: condensed industrial wordmark with Darbury Teal as
differentiator. Available on white, light grey, and dark backgrounds. Do not apply the
iSiteData logo where the Darbury mark is expected, and vice versa.

---

## Colour Palette

### Primary — use these for all primary UI decisions

| Name        | Hex       | Usage                                      |
|-------------|-----------|--------------------------------------------|
| Teal        | `#189B93` | Primary brand, CTAs, active states, user chat bubbles |
| Dark Teal   | `#334B49` | Headers, navigation, panel backgrounds, borders |
| Light Teal  | `#96B1AD` | Secondary surfaces, accents, muted highlights |
| Mauve       | `#BD759B` | Secondary brand, use sparingly             |
| Dark Mauve  | `#864268` | Strong accent, use sparingly               |

### Neutrals

| Name      | Hex       | Usage                              |
|-----------|-----------|------------------------------------|
| Ink       | `#191D23` | Darkest bg, dark-mode shells       |
| Slate 700 | `#57707A` | Secondary text, placeholders       |
| Slate 500 | `#78919E` | Muted text, subtitles, captions    |
| Slate 400 | `#979DAB` | Subtle borders, divider lines      |
| Slate 200 | `#C5BAC4` | Very subtle dividers               |
| Slate 100 | `#DEDCDC` | Light backgrounds, hairlines       |
| Off-white | `#F0F2F3` | Primary text on dark bg, light app bg |

### Accents — Warm

| Name        | Hex       | Usage                          |
|-------------|-----------|--------------------------------|
| Peach       | `#FFA17A` | Data visualisation             |
| Burnt Peach | `#E07B5C` | Data visualisation             |
| Magenta     | `#A33B79` | Strong accent                  |

### Accents — Cool

| Name   | Hex       | Usage                          |
|--------|-----------|--------------------------------|
| Blue   | `#0085BD` | Data visualisation             |
| Cyan   | `#0092AC` | Data visualisation             |
| Cobalt | `#4E72BB` | Data visualisation             |

### Status / Semantic

| Name    | Hex       | Usage                      |
|---------|-----------|----------------------------|
| Success | `#5BAD8A` | Confirmation, success state |
| Warning | `#F0B425` | Warnings, caution          |
| Error   | `#C94040` | Errors, destructive actions |
| Neutral | `#78919F` | Neutral status             |

### Derived interactive states

| Base        | Hover (darken ~15%) |
|-------------|---------------------|
| Teal        | `#147A73`           |
| Dark Teal   | `#233735`           |

---

## Typography

Two typefaces only. Do not introduce additional fonts.

| Font              | Role                    | Load weights          |
|-------------------|-------------------------|-----------------------|
| **Barlow Condensed** | Display, headings, overlines, labels | 600, 700, 800 |
| **Inter**         | Body, UI, captions, inputs | 400, 500, 600     |

Load via `next/font/google` in `app/layout.tsx`:

```ts
import { Barlow_Condensed, Inter } from 'next/font/google'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})
```

### Type scale

| Level        | Font              | Size  | Weight     | Tracking   | Notes           |
|--------------|-------------------|-------|------------|------------|-----------------|
| Display      | Barlow Condensed  | 72pt  | ExtraBold 800 | -0.02em | Hero headings   |
| H1           | Barlow Condensed  | 48pt  | ExtraBold 800 | -0.01em |                 |
| H2           | Barlow Condensed  | 36pt  | Bold 700      | 0       |                 |
| H3           | Barlow Condensed  | 28pt  | SemiBold 600  | 0       |                 |
| H4           | Barlow Condensed  | 22pt  | SemiBold 600  | 0       |                 |
| Body Large   | Inter             | 12pt  | Medium 500    | 0       | Leading 1.7     |
| Body Base    | Inter             | 10pt  | Regular 400   | 0       | Leading 1.7     |
| Body Small   | Inter             | 8pt   | Regular 400   | 0       | Leading 1.6     |
| Overline     | Inter             | 7pt   | SemiBold 600  | 0.12em  | UPPERCASE       |
| Label        | Inter             | 7pt   | SemiBold 600  | 0.08em  | UPPERCASE       |
| Caption      | Inter             | 7pt   | Regular 400   | 0       |                 |

---

## Component Patterns

These patterns apply across all Darbury websites. Match them exactly.

### Buttons

| Variant   | Background    | Text      | Border         |
|-----------|---------------|-----------|----------------|
| Primary   | `#189B93`     | `#191D23` | none           |
| Secondary | `#334B49`     | `#F0F2F3` | none           |
| Outline   | transparent   | `#F0F2F3` | `#334B49` 1px  |
| Ghost     | transparent   | `#F0F2F3` | none           |
| Danger    | `#864268`     | `#F0F2F3` | none           |

- Hover: darken background by ~15% (Primary → `#147A73`, Secondary → `#233735`)
- Border radius: `rounded-xl` (12px) for default; `rounded-full` for pill CTAs
- Font: Inter SemiBold 600, UPPERCASE tracking for overline-style labels
- Icons in buttons use standard 16–20px; gap between icon and label: 8px

### Badges & Tags

Rounded pill shape (`rounded-full`), small Inter text, coloured border with matching text:

| Tag style        | Border / Text colour |
|------------------|----------------------|
| Operational      | `#189B93` (Teal)     |
| Commissioned     | `#334B49` (Dark Teal)|
| Decommissioned   | `#864268` (Dark Mauve)|
| Maintenance      | `#BD759B` (Mauve)    |
| iSiteData        | `#191D23` (Ink) filled|
| Innovation       | `#BD759B` (Mauve) outline |
| Success          | `#5BAD8A`            |
| Error            | `#C94040`            |

### Cards

Three established card styles — pick based on context:

**Teal accent card** (primary service/product cards):
- White bg, Teal `#189B93` top border (3–4px), overline in Teal, title in Barlow Condensed Bold

**Mauve accent card** (secondary/consulting):
- White bg, Mauve `#BD759B` top border, overline in Mauve

**Dark filled card** (highlight/featured):
- Ink `#191D23` bg, white text, Teal overline, Barlow Condensed Bold title

### Form Inputs

- Background: white (light) / `#191D23` (dark)
- Border: `#C5BAC4` (Slate 200) default; `#189B93` (Teal) on focus
- Text: `#191D23` (light) / `#F0F2F3` (dark)
- Placeholder: `#57707A` (Slate 700) — must be set via `::placeholder` CSS
- Error border: `#C94040`, error text: `#C94040` below input
- Disabled: opacity 0.4, no pointer events
- Border radius: `rounded-xl` (12px)
- Font: Inter Regular 400

### Navigation

- Background: Dark Teal `#334B49`
- Active/hover link: Teal `#189B93`
- Inactive link text: Off-white `#F0F2F3` or Slate 500 `#78919E`
- Logo: white Darbury mark (use `filter: invert(1)` or white SVG variant)

### Section Overlines

Uppercase, Inter SemiBold, tracked, Teal `#189B93`, with a short Teal underline bar:

```
BRAND IDENTITY
──────────── (2px Teal underline, ~40px width)
```

---

## Dark vs Light Surfaces

Darbury uses both dark and light surfaces — choose based on context.

**Dark surface (primary for app UIs, hero sections, footers):**
- Background: Ink `#191D23` or Dark Teal `#334B49`
- Primary text: Off-white `#F0F2F3`
- Secondary text: Slate 500 `#78919E`
- Borders/dividers: Dark Teal `#334B49`
- Logo: white version (`filter: invert(1)`)

**Light surface (content sections, cards, forms):**
- Background: white or Off-white `#F0F2F3`
- Primary text: Ink `#191D23`
- Secondary text: Slate 700 `#57707A`
- Borders: Slate 200 `#C5BAC4`
- Logo: black version (`mix-blend-mode: multiply`)

---

## iSiteData Product Colour Palette

When building iSiteData-specific UIs (dashboards, platform screens), use this subset:

| Token     | Hex       | Role       |
|-----------|-----------|------------|
| Teal      | `#189B93` | Primary    |
| Dark Teal | `#334B49` | Headers    |
| Light Teal| `#96B1AD` | Accents    |
| Ink       | `#191D23` | App UI bg  |
| Off-white | `#F0F2F3` | App bg     |

---

## Brand Voice

- **Direct and knowledgeable** — no padding, no hedging
- **Practical, not theoretical** — focus on what gets solved
- **Warm but professional** — no corporate speak, no sales clichés
- **First-person from Dave** — "I", "my", "we" only where Darbury team is implied
- **Confident** — 42+ years of experience earns straight answers

Tone varies by surface:
- **Marketing/hero copy:** bold, condensed headlines (Barlow Condensed), short punchy body
- **Product/app UI:** functional, clear, no decoration
- **Chat/assistant:** conversational, first-person, 2–4 short paragraphs maximum

---

## Contact & Identity Details

| Field            | Value                          |
|------------------|--------------------------------|
| Name             | Dave Bradbury                  |
| Title            | Managing Director & Owner      |
| Company          | Darbury Ltd                    |
| Email            | dave@darbury.com               |
| Phone            | (+44) 07490 480020             |
| Location         | Essex, UK                      |
| Web              | www.darbury.com                |
| Alt web          | www.digitaltwin-services.com   |
| LinkedIn         | linkedin.com/in/darbury        |
| Twitter/X        | @dgbradbury                    |

---

## Service Pillars (for copy and navigation labels)

| Pillar                     | Sub-label                 |
|----------------------------|---------------------------|
| Digital Twin               | Engineering Information   |
| AI & Technology            | Innovation Consulting     |
| Standards & Governance     | Governance Frameworks     |

iSiteData is a **product**, not a service pillar — reference it separately in navigation and
hero sections where relevant.

---

## Developer Partnerships (for footer/about copy)

| Partner   | Scope                                   |
|-----------|-----------------------------------------|
| Autodesk  | Developer Partner — AutoCAD, Inventor, Revit |
| Apple     | Developer — iOS & iPadOS Apps           |
| Microsoft | Developer — .NET Applications           |

---

## Common Mistakes to Avoid

- Using `#3eb8a0` or similar approximate teals — the exact brand teal is `#189B93`
- Using dark backgrounds other than `#191D23` or `#334B49`
- Introducing any font other than Barlow Condensed and Inter
- Replacing the Eye mark with text initials or emoji
- Adding a box or container behind the logo
- Using `export const runtime = 'edge'` on API routes — use Fluid Compute (default Node.js)
- Hardcoding `ANTHROPIC_API_KEY` or any secret in client components
- Using `NEXT_PUBLIC_` prefix for any secret environment variable

---

## darbury.ai Site Extension (July 2026)

The darbury.ai site follows the brand palette above with two recorded, deliberate
exceptions:

1. **JetBrains Mono is allowed as a third font on darbury.ai only.** It is used for
   overlines, tags & technical labels to give the AI lab its terminal character. Do not
   carry it over to darbury.com or other Darbury properties.
2. **Dark-surface derived tokens.** `--bg-surface: #1E242B` and `--bg-elevated: #252C35`
   are Ink `#191D23` lightened in steps, and `--border: #2A3A38` is a muted Dark Teal for
   hairline borders on dark surfaces (full `#334B49` reads too strong at 1px). These are
   the approved dark-UI derivatives for this site.

All accent, text & status colours use the exact brand values (Teal `#189B93`,
hover `#147A73`, Off-white `#F0F2F3`, Slate 500/700 for secondary/muted text).

---

*Brand reference v1.0 — June 2026*
*Source: Darbury Design System v1.0, April 2026*
*For use by Claude as project context when building Darbury websites*
