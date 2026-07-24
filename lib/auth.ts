import { cookies } from "next/headers";
import { getKv } from "./kv";

export interface SessionUser {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
}

const SESSION_COOKIE = "darbury_lab_session";
const SESSION_TTL = 86400; // 24 hours

export async function validateSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const kv = getKv();
    const session = await kv.get<SessionUser>(`session:${token}`);
    return session ?? null;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = crypto.randomUUID();
  const kv = getKv();
  await kv.set(`session:${token}`, user, { ex: SESSION_TTL });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

type LabId = "brief" | "drawing" | "audit" | "extract" | "compliance";

export async function getUsageCount(
  email: string,
  lab: LabId
): Promise<number> {
  const kv = getKv();
  const date = new Date().toISOString().slice(0, 10);
  const count = await kv.get<number>(`usage:${email}:${date}:${lab}`);
  return count ?? 0;
}

export async function incrementUsage(
  email: string,
  lab: LabId
): Promise<number> {
  const kv = getKv();
  const date = new Date().toISOString().slice(0, 10);
  const key = `usage:${email}:${date}:${lab}`;

  const count = await kv.incr(key);
  // TTL until end of UTC day
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
  await kv.expire(key, ttl);

  return count;
}
