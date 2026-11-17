// Ask the Plant: the sample asset register & system prompt. Shared by the Lab
// route & the home page demo (which replays saved answers from this register).

// Canned demo dataset — stands in for a client's live Plant 3D model. Read-only.
// ponytail: hardcoded sample, not a DB. That's the whole point of the teaser.
export interface Asset {
  tag: string;
  description: string;
  type: string;
  line: string;
  area: string;
  status: "Operational" | "Commissioned" | "Decommissioned" | "Maintenance";
  pidBasis: boolean;
}

export const DATASET: Asset[] = [
  { tag: "P-101A", description: "Feed pump A", type: "Centrifugal pump", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "P-101B", description: "Feed pump B (standby)", type: "Centrifugal pump", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "P-201", description: "Transfer pump", type: "Centrifugal pump", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "P-202", description: "Recycle pump", type: "Centrifugal pump", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: true },
  { tag: "P-203", description: "Slops pump", type: "Positive displacement pump", line: "L-205", area: "Unit 20 — Transfer", status: "Maintenance", pidBasis: true },
  { tag: "P-301", description: "Product pump", type: "Centrifugal pump", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "TK-10", description: "Feed storage tank", type: "Atmospheric tank", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "TK-11", description: "Buffer tank", type: "Atmospheric tank", line: "L-105", area: "Unit 10 — Feed", status: "Commissioned", pidBasis: false },
  { tag: "V-201", description: "Flash drum", type: "Vessel", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "V-301", description: "Product separator", type: "Vessel", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "E-101", description: "Feed pre-heater", type: "Shell & tube exchanger", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "E-301", description: "Product cooler", type: "Shell & tube exchanger", line: "L-300", area: "Unit 30 — Product", status: "Maintenance", pidBasis: true },
  { tag: "C-201", description: "Recycle compressor", type: "Reciprocating compressor", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "FV-101", description: "Feed control valve", type: "Control valve", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "FV-201", description: "Transfer control valve", type: "Control valve", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "FV-301", description: "Product control valve", type: "Control valve", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "PSV-101", description: "Feed line relief valve", type: "Relief valve", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "PSV-301", description: "Separator relief valve", type: "Relief valve", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: false },
  { tag: "FT-101", description: "Feed flow transmitter", type: "Flow instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "FT-201", description: "Transfer flow transmitter", type: "Flow instrument", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "PT-101", description: "Feed pressure transmitter", type: "Pressure instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "PT-301", description: "Product pressure transmitter", type: "Pressure instrument", line: "L-300", area: "Unit 30 — Product", status: "Maintenance", pidBasis: true },
  { tag: "TT-101", description: "Pre-heater temp transmitter", type: "Temperature instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "TT-201", description: "Flash drum temp transmitter", type: "Temperature instrument", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "LT-10", description: "Feed tank level transmitter", type: "Level instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "LT-11", description: "Buffer tank level transmitter", type: "Level instrument", line: "L-105", area: "Unit 10 — Feed", status: "Commissioned", pidBasis: false },
];

export const ASK_PLANT_SYSTEM = `You are a plant data assistant answering natural-language questions over a read-only asset register from a Plant 3D model, on the Darbury AI Lab. You have 42 years of process-plant engineering behind you, so you read tags and lines like an engineer, not a search box.

You will be given the full asset register as JSON and a visitor's question. Answer using ONLY the data provided. Do not invent tags, lines, statuses, or attributes that are not in the register.

Return ONLY valid JSON (no markdown fences) with exactly these keys:
- answer: string — a direct, plain-English answer to the question, 1–3 short sentences. If the question can't be answered from the register, say so plainly.
- matchedTags: array of strings — the tags of every asset that satisfies the question, in register order. Empty array if none match or the question isn't a lookup.
- caveat: string — one short sentence noting any assumption you made reading the question, or "" if none.

Rules: this is a read-only query — never suggest changing, deleting, or writing data. Be precise about status and P&ID basis. No marketing language, no pricing.`;

export const STATUS_COLOUR: Record<string, string> = {
  Operational: "#189B93",
  Commissioned: "#334B49",
  Decommissioned: "#864268",
  Maintenance: "#BD759B",
};
