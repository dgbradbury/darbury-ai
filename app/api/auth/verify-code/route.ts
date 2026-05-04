import { NextRequest, NextResponse } from "next/server";
import { getKv } from "@/lib/kv";
import { createSession, setSessionCookie, SessionUser } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getResend } from "@/lib/resend";

const MAX_ATTEMPTS = 5;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const kv = getKv();
    const attemptsKey = `verify_attempts:${email}`;
    const attempts = (await kv.get<number>(attemptsKey)) ?? 0;

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    const data = await kv.get<SessionUser & { code: string }>(`verify:${email}`);
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Code expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    if (!timingSafeEqual(data.code, code)) {
      await kv.set(attemptsKey, attempts + 1, { ex: 3600 });
      return NextResponse.json({ success: false, error: "Incorrect code" }, { status: 400 });
    }

    // Valid — clean up verification keys
    await Promise.all([kv.del(`verify:${email}`), kv.del(attemptsKey)]);

    const user: SessionUser = {
      name: data.name,
      email: data.email,
      company: data.company,
      jobTitle: data.jobTitle,
      phone: data.phone,
    };

    const token = await createSession(user);
    await setSessionCookie(token);

    try {
      await logUserToFirestore(user);
      console.log('[verify-code] Firestore write success', email);
    } catch (e) {
      console.error("[verify-code] Firestore write failed:", e);
    }

    try {
      await notifyDave(user);
    } catch (e) {
      console.error("[verify-code] Dave notification failed:", e);
    }

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, company: user.company },
    });
  } catch (err) {
    console.error("[verify-code]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function logUserToFirestore(user: SessionUser): Promise<void> {
  const db = getDb();
  const ref = db.collection("lab_users").doc(user.email);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (doc.exists) {
      tx.update(ref, {
        lastVerified: FieldValue.serverTimestamp(),
        name: user.name,
        company: user.company,
        jobTitle: user.jobTitle,
        phone: user.phone,
      });
    } else {
      tx.set(ref, {
        email: user.email,
        name: user.name,
        company: user.company,
        jobTitle: user.jobTitle,
        phone: user.phone,
        firstVerified: FieldValue.serverTimestamp(),
        lastVerified: FieldValue.serverTimestamp(),
        totalSubmissions: 0,
        submissions: [],
      });
    }
  });
}

async function notifyDave(user: SessionUser): Promise<void> {
  const daveEmail = process.env.DAVE_EMAIL;
  if (!daveEmail) return;
  const resend = getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "AILab@darbury.com",
    to: daveEmail,
    subject: `New AI Lab verification — ${user.name} (${user.company})`,
    html: `<p><strong>${user.name}</strong> from <strong>${user.company}</strong> (${user.jobTitle}) has verified access to the Darbury AI Lab.</p><p>Email: ${user.email}<br/>Phone: ${user.phone}</p>`,
  });
}
