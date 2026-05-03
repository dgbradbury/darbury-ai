import { NextRequest, NextResponse } from "next/server";
import { getResend, CONTACT_TO, CONTACT_FROM } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message, project } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subject = project
      ? `Portfolio enquiry: ${project} — from ${name}`
      : `Portfolio enquiry from ${name}`;

    await getResend().emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        company ? `Company: ${company}` : "",
        project ? `Re: ${project}` : "",
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
