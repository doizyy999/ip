import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import dns from "dns/promises";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { EmailIntel } from "@/types";

const schema = z.object({ query: z.string().email().max(200) });

// Subset daftar disposable (full list: github.com/disposable-email-domains)
const DISPOSABLE = new Set([
  "mailinator.com", "tempmail.com", "temp-mail.org", "guerrillamail.com",
  "10minutemail.com", "yopmail.com", "trashmail.com", "getnada.com",
  "dispostable.com", "fakeinbox.com", "sharklasers.com", "maildrop.cc",
  "mohmal.com", "emailondeck.com", "tempmailo.com", "burnermail.io",
]);

async function gravatarLookup(email: string) {
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  try {
    const res = await fetch(`https://www.gravatar.com/${hash}.json`, {
      headers: { "User-Agent": "TRACE/1.0" },
    });
    if (res.status !== 200) return { exists: false, profileUrl: `https://gravatar.com/${hash}` };
    const json = await res.json();
    const entry = json.entry?.[0];
    return {
      exists: true,
      profileUrl: entry?.profileUrl,
      displayName: entry?.displayName,
      aboutMe: entry?.aboutMe,
      avatarUrl: entry?.thumbnailUrl,
      accounts: (entry?.accounts ?? []).map((a: Record<string, string>) => ({
        name: a.name,
        url: a.url,
      })),
    };
  } catch {
    return { exists: false };
  }
}

async function githubByEmail(email: string) {
  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email`,
      { headers: { "User-Agent": "TRACE/1.0", Accept: "application/vnd.github+json" } }
    );
    if (res.status !== 200) return [];
    const json = await res.json();
    return (json.items ?? []).slice(0, 5).map((u: Record<string, string>) => ({
      login: u.login,
      url: u.html_url,
      avatar: u.avatar_url,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(`email:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Email invalid (RFC 5322)" }, { status: 400 });

  const email = parsed.data.query.trim().toLowerCase();
  const domain = email.split("@")[1];

  const data = await cached(`email:${email}`, 3600_000, async (): Promise<EmailIntel> => {
    const [mxSettled, gravatar, github] = await Promise.allSettled([
      dns.resolveMx(domain).catch(() => []),
      gravatarLookup(email),
      githubByEmail(email),
    ]);
    const mxRecords =
      mxSettled.status === "fulfilled"
        ? (mxSettled.value as { exchange: string }[]).map((m) => m.exchange)
        : [];
    const grav = gravatar.status === "fulfilled" ? gravatar.value : null;
    const gh = github.status === "fulfilled" ? github.value : [];
    const disposable = DISPOSABLE.has(domain);

    const riskFactors: string[] = [];
    let riskScore = 0;
    if (disposable) { riskScore += 40; riskFactors.push("Disposable email domain"); }
    if (mxRecords.length === 0) { riskScore += 30; riskFactors.push("Domain tanpa MX record"); }
    if (grav?.exists) { riskScore += 10; riskFactors.push("Gravatar publik aktif (jejak identitas)"); }
    if (gh.length > 0) { riskScore += 10; riskFactors.push("Email muncul di GitHub publik"); }
    riskScore = Math.min(100, riskScore);

    return {
      email, valid: true, domain, mxRecords, disposable,
      gravatar: grav, github: gh, riskScore, riskFactors,
    };
  });

  return NextResponse.json({ success: true, data });
}
