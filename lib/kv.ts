import Redis from "ioredis";

// Thin wrapper that matches the @vercel/kv interface used across this codebase:
//   get<T>(key): Promise<T | null>          — returns parsed JSON or null
//   set(key, value, { ex }): Promise<void>  — serialises to JSON, sets TTL
//   incr(key): Promise<number>
//   expire(key, ttl): Promise<void>
//   del(...keys): Promise<void>

interface SetOptions {
  ex?: number; // TTL in seconds
}

interface KvClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: SetOptions): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
}

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL environment variable is not set");
    }
    _redis = new Redis(process.env.REDIS_URL, {
      // Prevent unhandled-rejection noise during connection errors
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }
  return _redis;
}

export function getKv(): KvClient {
  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await getRedis().get(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    },

    async set(key: string, value: unknown, opts?: SetOptions): Promise<void> {
      const serialised = typeof value === "string" ? value : JSON.stringify(value);
      if (opts?.ex) {
        await getRedis().set(key, serialised, "EX", opts.ex);
      } else {
        await getRedis().set(key, serialised);
      }
    },

    async incr(key: string): Promise<number> {
      return getRedis().incr(key);
    },

    async expire(key: string, ttl: number): Promise<void> {
      await getRedis().expire(key, ttl);
    },

    async del(...keys: string[]): Promise<void> {
      if (keys.length > 0) await getRedis().del(...keys);
    },
  };
}
