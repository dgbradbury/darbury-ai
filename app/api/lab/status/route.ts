import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getDb();
    const doc = await db.collection("config").doc("lab").get();

    if (!doc.exists) {
      // No config doc → labs are enabled by default
      return NextResponse.json({ enabled: true });
    }

    const data = doc.data();
    const enabled = data?.enabled !== false; // default to true if field missing
    const message = data?.disabledMessage ?? "The AI Lab is temporarily unavailable while we carry out updates. Please check back soon.";

    return NextResponse.json({ enabled, message });
  } catch (e) {
    console.error("[lab/status]", e);
    // On error, default to enabled so config issues don't lock out the labs
    return NextResponse.json({ enabled: true });
  }
}
