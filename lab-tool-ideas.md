# darbury.ai Lab — 5 New Tool Candidates

> Ideas for the next batch of Live AI Tools (`app/lab/`). Drafted July 2026.

## Where we are now

The Lab currently has three tools: **Engineering Brief Analyser**, **Drawing Intelligence Demo**, and **Automation Opportunity Finder**.

They share a clear character: free, in-browser, single-shot, email-gated, reviewed by Dave. They're teasers that show competence and capture a lead, not the full paid products (PIDA, ISO BOM, PlantMCP).

Two gaps in the current set. First, all three lean towards the AI & Technology pillar and say little for Digital Twin or Standards & Governance. Second, they mostly give *advice* ("here's what AI could do") rather than letting a client feel the real extraction and query engines. Any new tool should keep the quick-wow-plus-upsell shape and reuse assets that already exist.

## The five

### 1. Instant Tag & Line Extractor
*Pillar: Digital Twin / AI*

Upload a P&ID or ISO fragment and get back a structured, downloadable table of tags, lines, equipment & instruments in seconds. Drawing Intelligence shows what AI can see, this shows the client their own data in a spreadsheet. The PIDA / ISO BOM money-shot as a teaser, and the strongest upsell to the paid per-run service.

**Reuses:** PIDA + ISO BOM extraction pipeline. **Lowest-effort build.**

### 2. Ask the Plant
*Pillar: Digital Twin*

Natural-language query over a bundled sample Plant 3D dataset. A client types "list all decommissioned pumps on line 200 with no P&ID basis" and gets a real answer. Demonstrates the PlantMCP live-data story without touching a client's model, and shows the read-only plus human sign-off governance angle their engineering managers need to hear.

**Reuses:** PlantMCP (read-only policy) + a canned demo dataset. **Highest wow.**

### 3. Cloud-or-Local AI Advisor
*Pillar: AI & Technology / Standards & Governance*

The client describes their data sensitivity & workflow and gets a straight recommendation: cloud (Claude) vs on-prem (Ollama), which model, rough hardware, and why. This is the differentiator big consultancies can't match, made self-serve, and a natural front door to the "Darbury Local" product line.

**Reuses:** ISO BOM Local playbook + bench harness knowledge.

### 4. Digital Twin Readiness Scorer
*Pillar: Digital Twin*

The client describes their current asset data (spreadsheets, PDFs, scattered drawings) and gets a maturity score plus a staged roadmap. Encodes the "start small, build on known pockets of data, show what's achievable" philosophy. More specific and more impressive than the general Automation Finder because it scores and stages.

**Reuses:** Digital Twin methodology + iSiteData positioning.

### 5. Standard Compliance Gap Checker
*Pillar: Standards & Governance*

Paste an engineering spec, work instruction, or tag list and get back the gaps against a named standard (ISO 19650, tag-numbering conventions, naming rules). Serves the pillar that currently has no Lab tool, and it's an easy build (text in, reasoned gaps out).

**Reuses:** Standards & Governance frameworks + the reasoning pattern already in Brief Analyser. **Lowest-effort build.**

## Coverage

These hit all three pillars, where the current three skew AI-only. Two of them (#1, #2) let clients feel the real engines instead of reading advice, and every one has an obvious paid next step. Lowest-effort first builds are #1 and #5, highest wow is #2.
