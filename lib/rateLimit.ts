// Redis-backed rate limiter — shared across all Vercel function instances.
// Uses the existing lib/kv.ts Redis client (REDIS_URL env var required).
// Falls back to allowing the request if Redis is unavailable (fail-open for UX).

import { getKv } from "@/lib/kv";

const MAX_REQUESTS_PER_HOUR = 20;
const WINDOW_SECONDS = 60 * 60; // 1 hour

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const kv = getKv();
    const key = `rl:chat:${ip}`;

    const count = await kv.incr(key);

    // On first increment, set the TTL so the window expires automatically
    if (count === 1) {
      await kv.expire(key, WINDOW_SECONDS);
    }

    if (count > MAX_REQUESTS_PER_HOUR) {
      return {
        allowed: false,
        reason:
          "You've sent a lot of messages — please try again in an hour, or reach out via the contact form.",
      };
    }

    return { allowed: true };
  } catch (err) {
    // Fail-open: if Redis is unavailable, don't block the user
    console.warn("[rateLimit] Redis unavailable, failing open:", err);
    return { allowed: true };
  }
}
