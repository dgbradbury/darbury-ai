import { NextRequest, NextResponse } from "next/server";
import { getKv } from "@/lib/kv";

// Daily heartbeat write so the free Redis tier never counts as "inactive"
// and gets reaped. Scheduled via vercel.json crons. Vercel sends
// `Authorization: Bearer ${CRON_SECRET}` automatically when CRON_SECRET is set.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // A write (not just PING) is what resets the inactivity timer. 30-day TTL
    // so the key self-cleans if the cron ever stops.
    await getKv().set("keepalive:heartbeat", Date.now(), { ex: 2592000 });
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[keepalive]", err);
    return NextResponse.json({ error: "Redis unreachable" }, { status: 500 });
  }
}
