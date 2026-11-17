// The eight live Lab tools. One list, read by the Lab index & the home page
// grid, so the two can never disagree about what exists.
// icon: path data for a 24×24 line icon (stroke, no fill).

export interface LabTool {
  slug: string;
  title: string;
  short: string; // one line for the home page tile
  body: string; // full description on the Lab index
  icon: string;
}

export const LAB_TOOLS: LabTool[] = [
  {
    slug: "brief-analyser",
    title: "Engineering Brief Analyser",
    short: "Describe a problem, get the automation approach back.",
    body: "Paste a plain-English description of an engineering problem or workflow. Get back the likely automation approach, suggested toolchain, and what a working solution could look like in practice.",
    icon: "M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 16h5",
  },
  {
    slug: "drawing-intelligence",
    title: "Drawing Intelligence Demo",
    short: "See what AI reads from a photo of your drawing.",
    body: "Upload a photo of an engineering drawing, P&ID fragment, or sketch. Find out what AI can see — and what the Darbury automation pipeline could do with it.",
    icon: "M4 8V4h4 M16 4h4v4 M20 16v4h-4 M8 20H4v-4 M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6",
  },
  {
    slug: "automation-finder",
    title: "Automation Opportunity Finder",
    short: "Five questions, three automation ideas for your workflow.",
    body: "Answer 5 questions about your workflow. Get a personalised report of 3 specific automation opportunities — emailed to you and reviewed by Dave.",
    icon: "M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13 M15.5 15.5L20 20 M10.5 7.5v6 M7.5 10.5h6",
  },
  {
    slug: "extractor",
    title: "Instant Tag & Line Extractor",
    short: "P&ID or ISO in, a table of tags & lines out.",
    body: "Upload a P&ID or ISO fragment and get your own data back as a structured, downloadable table — tags, lines, equipment & instruments, read straight off the drawing.",
    icon: "M4 5h16v14H4z M4 10h16 M4 14.5h16 M10 5v14",
  },
  {
    slug: "compliance",
    title: "Standard Compliance Gap Checker",
    short: "Check a spec or tag list against a standard.",
    body: "Paste a spec, work instruction, or tag list, pick a standard (ISO 19650, tag-numbering, naming rules), and get back the gaps — each with a finding & a fix.",
    icon: "M12 3l7 3v5c0 4.5-3 8-7 10c-4-2-7-5.5-7-10V6z M9 12l2 2l4-4",
  },
  {
    slug: "ask-plant",
    title: "Ask the Plant",
    short: "Question a Plant 3D model in plain English.",
    body: 'Query a sample Plant 3D model in plain English — "list all decommissioned pumps on line 200 with no P&ID basis" — and get a real answer. A read-only demo of the live-data engine.',
    icon: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3s-3.1 3-7 3s-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  },
  {
    slug: "ai-advisor",
    title: "Cloud-or-Local AI Advisor",
    short: "Cloud or on-prem? A straight answer for your data.",
    body: "Describe your data sensitivity, workflow & hardware and get a straight call — cloud (Claude) vs on-prem (Ollama), which model, rough hardware, and why.",
    icon: "M7 13h10a3.5 3.5 0 0 0 .5-7A5 5 0 0 0 8 6.5A3.3 3.3 0 0 0 7 13z M6 16h12v5H6z M9 18.5h.01",
  },
  {
    slug: "readiness",
    title: "Digital Twin Readiness Scorer",
    short: "Score your asset data & get a staged roadmap.",
    body: "Describe your current asset data — spreadsheets, PDFs, scattered drawings — and get a maturity score plus a staged roadmap to a working digital twin.",
    icon: "M4 17a8 8 0 1 1 16 0 M12 17l4-5 M7 17h10",
  },
];
