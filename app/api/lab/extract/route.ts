import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb, getBucket } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_EXTRACT_DAILY_CAP ?? "3", 10);

// 5MB raw → ~6.87MB base64; cap at 7MB to be safe
const MAX_BASE64_LENGTH = Math.ceil(7 * 1024 * 1024);

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const EXT_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

interface ExtractItem {
  tag: string;
  category: string;
  description: string;
  detail: string;
}

const SYSTEM = `You are an engineering data extraction engine reviewing a P&ID, isometric, or process drawing uploaded to the Darbury AI Lab. Extract every tagged item you can clearly read into a structured table.

Return ONLY a valid JSON object (no markdown fences) with exactly these keys:
- documentType: string — one short sentence naming what the drawing appears to be (e.g. "A single-sheet P&ID for a cooling water circuit")
- items: array — one object per tagged item you can read, each with:
    - tag: string — the tag or line number exactly as printed (e.g. "P-101A", "6\"-CW-1024", "PT-205")
    - category: string — one of "Equipment", "Line", "Instrument", "Valve", "Other"
    - description: string — what the item is (e.g. "Centrifugal pump", "Cooling water line", "Pressure transmitter")
    - detail: string — any readable extra: size, service, spec, or connected equipment. Empty string if none.
- note: string — one honest line on legibility. If the image is too low-quality or nothing is tagged, say so here and return items: [].

Rules: only extract tags you can actually read — never invent, guess, or complete partial tags. If a value is unclear, omit that item rather than fabricate it. Order items by category (Equipment, then Line, Instrument, Valve, Other). Cap at 60 items.`;

async function saveToStorage(
  imageBase64: string,
  mimeType: AllowedMimeType,
  submissionId: string
): Promise<string | null> {
  try {
    const ext = EXT_MAP[mimeType] ?? "bin";
    const fileName = `lab-extractor/${submissionId}.${ext}`;
    const bucket = getBucket();
    const file = bucket.file(fileName);
    const buffer = Buffer.from(imageBase64, "base64");
    await file.save(buffer, { contentType: mimeType, metadata: { cacheControl: "private, max-age=86400" } });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (e) {
    console.error("[lab/extract] Storage upload failed:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Session expired. Please verify again." }, { status: 401 });
    }

    const usageCount = await getUsageCount(user.email, "extract");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, WEBP, and PDF files are accepted" },
        { status: 400 }
      );
    }
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    const imageSizeBytes = Math.floor(imageBase64.length * 0.75);
    const isPdf = mimeType === "application/pdf";

    const fileContent = isPdf
      ? {
          type: "document" as const,
          source: { type: "base64" as const, media_type: "application/pdf" as const, data: imageBase64 },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mimeType as "image/png" | "image/jpeg" | "image/webp",
            data: imageBase64,
          },
        };

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: isPdf ? 2500 : 1800,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            fileContent,
            { type: "text" as const, text: "Extract every tagged item from this drawing into the structured table." },
          ],
        },
      ],
    });

    const rawText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: { documentType: string; items: ExtractItem[]; note: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // ponytail: Haiku very rarely emits trailing prose after the JSON; grab the first {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { documentType: "", items: [], note: "Could not read the drawing — try a clearer file." };
    }
    const items = Array.isArray(parsed.items) ? parsed.items.slice(0, 60) : [];

    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = inputTokens * 0.0000008 + outputTokens * 0.000004;

    await incrementUsage(user.email, "extract");

    let submissionId = "";
    let imageStorageUrl: string | null = null;
    try {
      const db = getDb();
      const docRef = db.collection("lab_submissions").doc();
      submissionId = docRef.id;
      imageStorageUrl = await saveToStorage(imageBase64, mimeType as AllowedMimeType, submissionId);

      await docRef.set({
        lab: "tag-line-extractor",
        timestamp: FieldValue.serverTimestamp(),
        user: {
          name: user.name,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        input: {
          mimeType,
          imageSizeBytes,
          imageStorageUrl: imageStorageUrl ?? null,
          imageStored: imageStorageUrl !== null,
        },
        output: {
          documentType: parsed.documentType ?? "",
          itemCount: items.length,
          items,
          note: parsed.note ?? "",
          rawHaikuResponse: rawText,
        },
        aiUsage: {
          model: HAIKU_MODEL,
          inputTokens,
          outputTokens,
          costUsd: parseFloat(costUsd.toFixed(6)),
        },
        daveReviewed: false,
        daveNotes: "",
      });
      console.log("[lab/extract] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/extract] Firestore write failed:", e);
    }

    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const mimeLabel = isPdf ? "PDF" : mimeType.replace("image/", "").toUpperCase();
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;
        const rows = items
          .map(
            (it) =>
              `<tr><td style="padding:5px 10px 5px 0;font-size:13px;color:#3eb8a0;font-family:monospace;">${it.tag}</td><td style="padding:5px 10px 5px 0;font-size:13px;color:#8a9bb0;">${it.category}</td><td style="padding:5px 10px 5px 0;font-size:13px;">${it.description}</td><td style="padding:5px 0;font-size:13px;color:#8a9bb0;">${it.detail ?? ""}</td></tr>`
          )
          .join("");

        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 4 Lead] ${user.name} — ${user.company} — Tag & Line Extractor (${items.length} items)`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 4</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Tag &amp; Line Extraction — ${items.length} items</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Uploaded Drawing</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px;margin-bottom:24px;">
    <p style="font-size:13px;margin:0 0 8px;color:#8a9bb0;">${mimeLabel} &middot; ${parsed.documentType ?? ""}</p>
    ${imageStorageUrl
      ? `<a href="${imageStorageUrl}" style="display:inline-block;background:#3eb8a0;color:#0a0e14;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;">View Uploaded Drawing →</a>`
      : `<p style="font-size:12px;color:#4a5568;margin:0;font-style:italic;">Image storage unavailable — reply to user for the original file</p>`}
  </div>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Extracted Table</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px 20px;margin-bottom:8px;">
    <table style="width:100%;border-collapse:collapse;">${rows || `<tr><td style="font-size:13px;color:#8a9bb0;">No items extracted. ${parsed.note ?? ""}</td></tr>`}</table>
  </div>
  ${parsed.note ? `<p style="font-size:12px;color:#8a9bb0;margin:0 0 24px;font-style:italic;">${parsed.note}</p>` : ""}

  <div style="border-top:1px solid #1e2d3d;padding-top:12px;margin-top:20px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>
          `.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/extract] Dave notification failed:", e);
    }

    return NextResponse.json({
      documentType: parsed.documentType ?? "",
      items,
      note: parsed.note ?? "",
      imageUrl: imageStorageUrl,
    });
  } catch (err) {
    console.error("[lab/extract]", err);
    return NextResponse.json({ error: "Extraction unavailable" }, { status: 500 });
  }
}
