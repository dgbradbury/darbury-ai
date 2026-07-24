# darbury.ai Lab — The 5 New Tools, Explained

> A plain-English walkthrough of the five tools added to the Lab from `lab-tool-ideas.md`.
> Written so I can understand what each one actually does, where it stops, and where it could go next.
> Built July 2026. The Lab now runs eight tools in total (the original three plus these five).

---

## How to read this

Each tool gets four things. What it's for (the use). How it works under the bonnet (so I know what I'm paying for and what can break). The limits (what it deliberately doesn't do). And the potential (where it goes if a client bites).

Two of the five let a client feel the real engine rather than read advice about it (the Extractor and Ask the Plant). The other three are reasoning tools that turn a short conversation into a straight, useful answer. Every one of them is a teaser that captures a lead, not the paid product.

---

## What all five share

Before the individual tools, the plumbing they have in common, because it's the same on every one.

- **Email gate.** A visitor verifies an email once, which gives them a 24-hour session (a cookie). No verified session, no tool. This is what keeps the bots out and tells me who's using them.
- **Daily cap per person.** Each tool counts uses per email per day in Redis and stops them at the cap (3 on most, 6 on Ask the Plant because it's exploratory). The cap resets at midnight UTC. If Redis is unavailable the limiter fails open, so a Redis wobble never locks a real visitor out.
- **Dave reviews every submission.** Every run emails me the lead (who they are, what they asked, what the tool answered, and what the AI call cost). Every submission is also logged to Firestore in the `lab_submissions` collection with the same detail, so nothing is lost if an email bounces.
- **Model split.** The Extractor runs on Claude Sonnet because it has to read a drawing (vision, and accuracy matters). The other four run on Claude Haiku, which is fast and cheap and plenty for reasoned text in and structured text out.
- **Structured output.** Every tool asks the model for strict JSON and parses it, with a fallback that grabs the first `{...}` block if the model ever wraps its answer in prose. So the on-screen result is always a clean card, never a wall of chat.

The five below are ordered as they are in the ideas doc.

---

## 1. Instant Tag & Line Extractor

**Route:** `/lab/extractor` · **API:** `/api/lab/extract` · **Model:** Claude Sonnet (vision)

### The use
A visitor uploads a P&ID, an isometric, or a process drawing, and gets their own data back as a structured, downloadable table of tags, lines, equipment, instruments & valves, read straight off the drawing. Where the Drawing Intelligence demo shows what AI can *see*, this one hands the client their own data in a spreadsheet. It's the PIDA and ISO BOM money-shot as a free taster.

### How it works
Accepts PNG, JPG, WEBP, or PDF up to 5MB. The file goes to Sonnet with a strict extraction prompt, and comes back as a table of up to 60 items, each with a tag, a category, a description, and any readable detail (size, service, spec). The uploaded drawing is saved to Firebase Storage so I can open the original alongside the extraction when I review the lead. Single-shot, thinking disabled, so it stays fast and predictable.

### The limits
It reads what's legible and nothing more. The prompt tells it never to guess or complete a partial tag, so a blurry scan gives fewer rows rather than wrong ones (that's the right trade for engineering data). It's capped at 60 items, one drawing at a time, 5MB, and 3 runs a day per person. It does not connect tags to each other, build a line list, or cross-check against a register. That's the paid pipeline, not the taster.

### The potential
This is the strongest upsell in the set, straight into the paid per-run PIDA / ISO BOM service. Natural next steps are multi-page and full-drawing-set handling, tag-to-tag relationships (what's connected to what), export to Excel or a real BOM format, and a confidence flag per row so a reviewer knows where to look first.

---

## 2. Ask the Plant

**Route:** `/lab/ask-plant` · **API:** `/api/lab/ask-plant` · **Model:** Claude Haiku

### The use
A visitor types a plain-English question over a sample plant model and gets a real answer. Something like "list all decommissioned pumps on line 200 with no P&ID basis" comes back as a written answer plus a table of the exact assets that match. It shows the PlantMCP live-data story without anyone touching a client's model, and it makes the read-only, human-sign-off governance angle real instead of a promise. This is the highest-wow tool in the set.

### How it works
There's a bundled demo dataset of 26 assets across three units (pumps, tanks, vessels, exchangers, valves & instruments), each with a tag, line, area, status & P&ID basis. The whole register plus the visitor's question goes to Haiku, which answers using only that data and hands back the tags that match. The tool then resolves those tags back to the full rows and draws the table. There are example questions on screen so a first-timer can click one and see it work.

### The limits
The dataset is canned and hardcoded (that's deliberate, it's the teaser). It's read-only by design, the prompt refuses to suggest changing, deleting, or writing anything, and the on-screen copy says so. It answers from 26 assets, not a real model, so it can't surprise a client with their own data yet. Capped at 6 questions a day per person.

### The potential
The obvious progression is pointing the same read-only query engine at a client's live Plant 3D model through PlantMCP, keeping the human sign-off on every answer. From there, saved queries, scheduled checks (for example "flag any operational asset that loses its P&ID basis"), and a proper audit trail of who asked what. This is the front door to the live-data product, so the closer the demo feels to the real thing, the better it sells.

---

## 3. Cloud-or-Local AI Advisor

**Route:** `/lab/ai-advisor` · **API:** `/api/lab/ai-advisor` · **Model:** Claude Haiku

### The use
A visitor describes their data sensitivity, their workflow, their expected volume & the hardware they've got, and gets a straight recommendation. Cloud (Claude) or on-prem (Ollama) or a hybrid, which model to use, roughly what hardware that implies, and why. It's the kind of answer a big consultancy charges for a workshop to give you, made self-serve. It's also the natural front door to the Darbury Local product line.

### How it works
Three dropdowns (sensitivity, volume, hardware) and a free-text box describing the workflow. Haiku weighs them and returns a recommendation, a one-line headline, a concrete model suggestion, a rough hardware note, three to five reasoning points, and one honest caveat. The prompt is told to lead with data sensitivity, so regulated or air-gapped data pushes the answer towards on-prem even where that costs some capability, and to say so plainly rather than sell cloud by default.

### The limits
It's a first-pass steer, not a spec or a quote. It works from four inputs and a paragraph, so it can't see the real detail (exact data, true throughput, budget, existing licences) that a proper call needs. It gives no pricing figures. Capped at 3 runs a day per person.

### The potential
It could grow into a short guided assessment that ends in a rough cost-per-month comparison of cloud versus local for their actual volume, a suggested starter hardware spec, and a downloadable one-pager they can take to their management. Tie it to the bench-harness results from ISO BOM Local and it could name the specific local model that passed on hardware like theirs, which is a claim the big consultancies genuinely can't match.

---

## 4. Digital Twin Readiness Scorer

**Route:** `/lab/readiness` · **API:** `/api/lab/readiness` · **Model:** Claude Haiku

### The use
A visitor describes the state of their asset data (spreadsheets, PDFs, scattered drawings, an ageing CMMS, whatever it is) and gets a maturity score out of 100, a band, a breakdown across a few dimensions, and a staged roadmap of what to do next. It's more specific and more impressive than the general Automation Finder because it actually scores and stages, and it encodes how I really run a rollout. Start small, build on the pockets of data you already have, show what's achievable, then take the next step.

### How it works
Three dropdowns (how centralised the data is, the dominant format, whether there's live data) plus a description box. Haiku returns an overall score & band (Nascent, Developing, Established, Advanced), a short summary, three or four scored dimensions each with a note, and a three-stage roadmap where every stage builds on the one before. The score drives a dial and the dimensions draw as bars, so it reads at a glance. The server clamps every score to 0–100 and caps the roadmap at three stages, so a stray number from the model can't break the display.

### The limits
The score comes from a self-description, not an audit, so it's only as honest as the answers. It's a directional maturity read, not a certified assessment, and it deliberately doesn't try to be one. The roadmap is generic to what they told me rather than costed or scheduled. Capped at 3 runs a day per person.

### The potential
It could become a longer assessment that scores more dimensions, saves a baseline so a client can re-run it in six months and see movement, and produces a branded PDF roadmap. Longer term it maps neatly onto iSiteData positioning. A readiness score today, an actual staged data-and-AR rollout tomorrow.

---

## 5. Standard Compliance Gap Checker

**Route:** `/lab/compliance` · **API:** `/api/lab/compliance` · **Model:** Claude Haiku

### The use
A visitor pastes a spec, a work instruction, a tag list, or a naming schema, picks a standard, and gets back the gaps. Each gap comes with a severity, the area it concerns, a plain finding, and one concrete fix. It serves the Standards & Governance pillar, which had no Lab tool before this, and it was one of the two easiest builds (text in, reasoned gaps out).

### How it works
A dropdown of standards (ISO 19650, tag-numbering / KKS, equipment & line naming, ISA-5.1, or general data-quality best practice) and a text box that takes between 30 and 4,000 characters. Haiku assesses the text against the chosen standard and returns an overall assessment plus up to 12 gaps, ordered most severe first. The prompt is told to only report gaps it can actually justify from the text, and to return none if the text is genuinely compliant, so it doesn't pad the list to look busy.

### The limits
It only sees the text that's pasted in, so it judges what's in front of it, not the wider document set or the live schema behind it. It's a fast first pass, capped at 4,000 characters, 12 gaps, and 3 runs a day per person. A real governance review works from the client's actual documents and naming schema, which this can't reach.

### The potential
It reuses the reasoning pattern already in the Brief Analyser, so it's cheap to extend. Natural next steps are more standards, checking a whole document instead of a pasted snippet, checking a tag list against a client's own naming rules (not just a public standard), and a downloadable gap report they can circulate. It's the obvious lead-in to a full governance framework engagement.

---

## The shape of the set

Between them these five hit all three pillars, where the original three skewed AI-only. Digital Twin gets three tools (the Extractor, Ask the Plant, and the Readiness Scorer), Standards & Governance finally gets one (the Compliance Checker), and the AI & Technology pillar picks up the Advisor. Two of them let a client feel the real engine, and every single one has an obvious paid next step behind it.

If I want to prioritise where to spend real build effort next, the two with the strongest pull-through are the Extractor (straight into the paid PIDA / ISO BOM runs) and Ask the Plant (the front door to the live PlantMCP product). Both would benefit most from getting closer to a client's own data.

Have a look, run each one a few times, and see which answers feel sharp and which need the prompt tightening. It's quick to tune any of them, the reasoning all lives in one system prompt per tool.
