import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb, getBucket } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_DRAWING_DAILY_CAP ?? "3", 10);

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

const SYSTEM = `You are an expert engineering technology consultant reviewing an image submitted by a visitor to the Darbury AI Lab. The visitor has uploaded a photo of an engineering drawing, diagram, sketch, or P&ID fragment.

Your job is to:
1. Describe what you can see in the image — what type of drawing or document it appears to be, what it likely represents, and the level of detail or quality visible
2. Assess what the content represents in an engineering or process context
3. Explain concretely what Darbury's automation pipeline could do with this kind of document — specifically referencing OCR extraction, PDF-to-DWG conversion, AI-assisted data capture, or other relevant capabilities depending on what you see
4. If the image is too low quality, unclear, or unrecognisable, say so honestly — then explain that working with the original digital file (rather than a photo) would allow a much deeper analysis, and suggest the visitor contacts Dave directly

Write in a conversational, direct tone — as if you are a senior engineer talking to a peer. Do not use bullet points or headers. Do not make up details you cannot see. Do not fabricate specific tag numbers, instrument labels, or drawing numbers — describe generally what type of content is present.

Max response length: 400 tokens.`;

const SYSTEM_PDF = `You are an expert engineering technology consultant reviewing a PDF document submitted by a visitor to the Darbury AI Lab. The visitor has uploaded an engineering PDF — this may be a single drawing, a multi-page P&ID package, a drawing register, a specification document, or a set of engineering sketches.

Your job is to:
1. Read every page of the document. State how many pages you can see and what type of content each page appears to contain (e.g. "Page 1 appears to be a process flow diagram; pages 2–4 are P&ID sheets; page 5 looks like a tag register").
2. Provide an overall assessment of what the document represents in an engineering or process context — the system or plant section depicted, the level of detail, and the apparent purpose of the document.
3. Explain concretely what Darbury's automation pipeline could do with this kind of document — specifically referencing OCR extraction, PDF-to-DWG conversion, AI-assisted data capture from P&IDs, instrument tag extraction, or other relevant capabilities depending on what you see across the pages.
4. If the PDF is too low quality, password-protected, or unreadable, say so honestly and suggest the visitor contacts Dave directly with the original file.

Write in a conversational, direct tone — as if you are a senior engineer talking to a peer. Do not use bullet points or headers. Do not fabricate specific tag numbers, instrument labels, or drawing numbers you cannot clearly read — describe the type of content present.

Max response length: 700 tokens.`;

async function saveImageToStorage(
  imageBase64: string,
  mimeType: AllowedMimeType,
  submissionId: string
): Promise<string | null> {
  try {
    const ext = EXT_MAP[mimeType] ?? "bin";
    const fileName = `lab2-drawings/${submissionId}.${ext}`;
    const bucket = getBucket();
    const file = bucket.file(fileName);
    const buffer = Buffer.from(imageBase64, "base64");
    await file.save(buffer, { contentType: mimeType, metadata: { cacheControl: "private, max-age=86400" } });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (e) {
    console.error("[lab/drawing] Storage upload failed:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate session
    const user = await validateSession();
    if (!user) {
      return NextResponse.json(
        { error: "Session expired. Please verify again." },
        { status: 401 }
      );
    }

    // 2. Check daily usage cap
    const usageCount = await getUsageCount(user.email, "drawing");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    // 3. Parse and validate input
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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

    // Approximate raw byte size from base64 length (base64 is ~4/3 larger than raw)
    const imageSizeBytes = Math.floor(imageBase64.length * 0.75);

    // 4. Call Haiku — branch on PDF vs image
    const isPdf = mimeType === "application/pdf";

    const fileContent = isPdf
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: imageBase64,
          },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mimeType as "image/png" | "image/jpeg" | "image/webp",
            data: imageBase64,
          },
        };

    const userText = isPdf
      ? "Please analyse this engineering document. Read all pages and provide a thorough overview of what is present across the full document."
      : "Please analyse this engineering drawing or diagram.";

    const maxTokens = isPdf ? 1000 : 600;
    const systemPrompt = isPdf ? SYSTEM_PDF : SYSTEM;

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            fileContent,
            { type: "text" as const, text: userText },
          ],
        },
      ],
    });

    const rawText =
      aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";

    // 5. Calculate token cost (Haiku pricing: $0.80/MTok input, $4.00/MTok output)
    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = (inputTokens * 0.0000008) + (outputTokens * 0.000004);

    // 6. Increment usage counter
    await incrementUsage(user.email, "drawing");

    // 7. Log to Firestore — generate a doc ID first so we can use it for Storage path
    let submissionId = "";
    let imageStorageUrl: string | null = null;

    try {
      const db = getDb();
      const docRef = db.collection("lab_submissions").doc();
      submissionId = docRef.id;

      // Save image to Firebase Storage now we have a stable ID
      imageStorageUrl = await saveImageToStorage(imageBase64, mimeType as AllowedMimeType, submissionId);

      await docRef.set({
        lab: "drawing-intelligence",
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
          conversationalResponse: rawText,
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
      console.log("[lab/drawing] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/drawing] Firestore write failed:", e);
    }

    // 8. Notify Dave
    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const mimeLabel = mimeType === "application/pdf" ? "PDF" : mimeType.replace("image/", "").toUpperCase();
        const sizeLabel =
          imageSizeBytes < 1024 * 1024
            ? `${(imageSizeBytes / 1024).toFixed(0)} KB`
            : `${(imageSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;

        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 2 Lead] ${user.name} — ${user.company} — Drawing Intelligence`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 2</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">New Drawing Intelligence Submission</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:6px 0;font-size:13px;">${user.phone}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Uploaded Drawing</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px;margin-bottom:24px;">
    <p style="font-size:13px;margin:0 0 8px;color:#8a9bb0;">${mimeLabel} &middot; ${sizeLabel}</p>
    ${imageStorageUrl
      ? `<a href="${imageStorageUrl}" style="display:inline-block;background:#3eb8a0;color:#0a0e14;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;">View Uploaded Drawing →</a>`
      : `<p style="font-size:12px;color:#4a5568;margin:0;font-style:italic;">Image storage unavailable — reply to user to request the original file</p>`
    }
  </div>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">AI Assessment</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:20px;margin-bottom:24px;">
    <p style="font-size:14px;margin:0;line-height:1.8;color:#e8edf4;">${rawText.replace(/\n\n/g, "</p><p style=\"font-size:14px;margin:12px 0 0;line-height:1.8;color:#e8edf4;\">").replace(/\n/g, "<br/>")}</p>
  </div>

  <div style="border-top:1px solid #1e2d3d;padding-top:12px;margin-top:4px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>
          `.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/drawing] Dave notification failed:", e);
    }

    return NextResponse.json({ response: rawText, mimeType, imageUrl: imageStorageUrl });
  } catch (err) {
    console.error("[lab/drawing]", err);
    return NextResponse.json({ error: "Analysis unavailable" }, { status: 500 });
  }
}
