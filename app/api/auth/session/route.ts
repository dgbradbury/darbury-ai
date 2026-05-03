import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";

export async function GET() {
  const user = await validateSession();
  if (!user) {
    return NextResponse.json({ expired: false }, { status: 401 });
  }
  return NextResponse.json({ user });
}
