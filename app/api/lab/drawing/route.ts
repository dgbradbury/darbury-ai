import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_DRAWING_DAILY_CAP ?? "3", 10);

// 4MB raw → ~5.33MB base64; cap at 5.5MB to be safe
const MAX_BASE64_LENGTH = Math.ceil(5.5 * 1024 * 1024);

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const SYSTEM = `You are an expert engineering technology consultant reviewing an image submitted by a visitor to the Darbury AI Lab. The visitor has uploaded a photo of an engineering drawing, diagram, sketch, or P&ID fragment.

Your job is to:
1. Describe what you can see in the image — what type of drawing or document it appears to be, what it likely represents, and the level of detail or quality visible
2. Assess what the content represents in an engineering or process context
3. Explain concretely what Darbury's automation pipeline could do with this kind of document — specifically referencing OCR extraction, PDF-to-DWG conversion, AI-assisted data capture, or other relevant capabilities depending on what you see
4. If the image is too low quality, unclear, or unrecognisable, say so honestly — then explain that working with the original digital file (rather than a photo) would allow a much deeper analysis, and suggest the visitor contacts Dave directly

Write in a conversational, direct tone — as if you are a senior engineer talking to a peer. Do not use bullet points or headers. Do not make up details you cannot see. Do not fabricate specific tag numbers, instrument labels, or drawing numbers — describe generally what type of content is present.

Max response length: 400 tokens.`;

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
        { error: "Only PNG, JPG, and WEBP images are accepted" },
        { status: 400 }
      );
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ error: "Image must be under 4MB" }, { status: 400 });
    }

    // Approximate raw byte size from base64 length (base64 is ~4/3 larger than raw)
    const imageSizeBytes = Math.floor(imageBase64.length * 0.75);

    // 4. Call Haiku with vision
    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as AllowedMimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Please analyse this engineering drawing or diagram.",
            },
          ],
        },
      ],
    });

    const rawText =
      aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";

    // 5. Increment usage counter
    await incrementUsage(user.email, "drawing");

    // 6. Log to Firestore (image not retained — metadata only)
    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
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
          imageStored: false,
        },
        output: {
          conversationalResponse: rawText,
          rawHaikuResponse: rawText,
        },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/drawing] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/drawing] Firestore write failed:", e);
    }

    // 7. Notify Dave
    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const mimeLabel = mimeType.replace("image/", "").toUpperCase();
        const sizeLabel =
          imageSizeBytes < 1024 * 1024
            ? `${(imageSizeBytes / 1024).toFixed(0)} KB`
            : `${(imageSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

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

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Image Details</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px;margin-bottom:24px;">
    <p style="font-size:13px;margin:0;color:#8a9bb0;">${mimeLabel} &middot; ${sizeLabel} &middot; <em style="color:#4a5568;">Image not retained — reply to user to request the original file</em></p>
  </div>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">AI Assessment</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:20px;margin-bottom:24px;">
    <p style="font-size:14px;margin:0;line-height:1.8;color:#e8edf4;">${rawText.replace(/\n\n/g, "</p><p style=\"font-size:14px;margin:12px 0 0;line-height:1.8;color:#e8edf4;\">").replace(/\n/g, "<br/>")}</p>
  </div>

  <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
</div>
          `.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/drawing] Dave notification failed:", e);
    }

    return NextResponse.json({ response: rawText });
  } catch (err) {
    console.error("[lab/drawing]", err);
    return NextResponse.json({ error: "Analysis unavailable" }, { status: 500 });
  }
}
