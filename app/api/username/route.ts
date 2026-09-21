import { NextResponse } from "next/server";
import { z } from "zod";
import { PLATFORMS } from "@/lib/platforms";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { PlatformHit } from "@/types";

const schema = z.object({ query: z.string().min(2).max(50).regex(/^[a-zA-Z0-9._-]+$/) });

async function checkPlatform(
  name: string,
  category: string,
  urlTemplate: string,
  username: string
): Promise<PlatformHit> {
  const url = urlTemplate.replace("{u}", encodeURIComponent(username));
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });
    // Konsumsi sebagian body agar koneksi rapi
    const text = await res.text();
    let status: PlatformHit["status"] = "not_found";
    if (res.status === 200) {
      const lower = text.slice(0, 200_000).toLowerCase();
      const notFoundHints = [
        "page not found", "user not found", "profile not found",
        "this account doesn", "account suspended", "no such user",
        "couldn't find", "could not find", "doesn't exist", "does not exist",
      ];
      status = notFoundHints.some((h) => lower.includes(h)) ? "not_found" : "found";
    } else if (res.status === 404) {
      status = "not_found";
    } else if ([403, 429, 999].includes(res.status)) {
      status = "error"; // diblokir / rate-limited platform
    }
    return { platform: name, category, url, status, httpStatus: res.status, responseMs: Date.now() - started };
  } catch {
    return { platform: name, category, url, status: "error", responseMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(`username:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Username invalid" }, { status: 400 });
  }
  const username = parsed.data.query;

  const results = await cached(`username:${username.toLowerCase()}`, 3600_000, async () => {
    // Batch 10 platform per gelombang → ~1 req/detik efektif per host, total terkontrol
    const hits: PlatformHit[] = [];
    const BATCH = 10;
    for (let i = 0; i < PLATFORMS.length; i += BATCH) {
      const batch = PLATFORMS.slice(i, i + BATCH);
      const settled = await Promise.allSettled(
        batch.map((p) => checkPlatform(p.name, p.category, p.url, username))
      );
      for (const s of settled) if (s.status === "fulfilled") hits.push(s.value);
    }
    return hits;
  });

  const found = results.filter((r) => r.status === "found");
  return NextResponse.json({
    success: true,
    data: {
      username,
      total: results.length,
      foundCount: found.length,
      results,
    },
  });
}
