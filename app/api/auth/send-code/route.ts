import { NextRequest, NextResponse } from "next/server";
import { getKv } from "@/lib/kv";
import { getResend } from "@/lib/resend";
import { verificationEmailHtml } from "@/lib/verification-email";

const CODE_TTL = 900; // 15 minutes
const MAX_REQUESTS_PER_HOUR = 3;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, jobTitle, phone } = body;

    if (!name || !email || !company || !jobTitle || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const kv = getKv();
    const rateLimitKey = `verify_requests:${email}`;
    const requestCount = (await kv.get<number>(rateLimitKey)) ?? 0;

    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many code requests. Please try again later." },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await kv.set(
      `verify:${email}`,
      JSON.stringify({ code, name, email, company, jobTitle, phone }),
      { ex: CODE_TTL }
    );

    const newCount = requestCount + 1;
    await kv.set(rateLimitKey, newCount, { ex: 3600 });

    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "AILab@darbury.com",
      to: email,
      subject: `Your Darbury AI Lab access code: ${code}`,
      html: verificationEmailHtml(code),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-code]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
