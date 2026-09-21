// Rate limiter in-memory (per instance). Untuk multi-instance production,
// ganti dengan @upstash/ratelimit + Redis.
const buckets = new Map<string, number[]>();

export interface RateResult {
  ok: boolean;
  retryAfter?: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    return { ok: false, retryAfter: Math.ceil((arr[0] + windowMs - now) / 1000) };
  }
  arr.push(now);
  buckets.set(key, arr);
  // bersih-bersih ringan supaya Map tidak bocor
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { ok: true };
}

export function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
