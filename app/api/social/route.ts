import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { SocialProfile } from "@/types";

const schema = z.object({ query: z.string().min(2).max(100) });

function fakeHeuristics(p: Partial<SocialProfile>): string[] {
  const signals: string[] = [];
  if ((p.followers ?? 0) < 10 && (p.following ?? 0) > 200)
    signals.push("Following jauh lebih banyak dari followers");
  if (!p.bio) signals.push("Bio kosong");
  if (!p.avatar) signals.push("Tanpa avatar");
  return signals;
}

async function github(u: string): Promise<SocialProfile> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(u)}`, {
      headers: { "User-Agent": "TRACE/1.0", Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status !== 200) return { platform: "GitHub", found: false };
    const j = await res.json();
    const p: SocialProfile = {
      platform: "GitHub", found: true, name: j.name, username: j.login,
      bio: j.bio, avatar: j.avatar_url, followers: j.followers,
      following: j.following, joinedAt: j.created_at, lastActivity: j.updated_at,
      url: j.html_url,
      extra: { publicRepos: j.public_repos, company: j.company, location: j.location, blog: j.blog },
    };
    p.fakeSignals = fakeHeuristics(p);
    return p;
  } catch {
    return { platform: "GitHub", found: false };
  }
}

async function reddit(u: string): Promise<SocialProfile> {
  try {
    const res = await fetch(`https://www.reddit.com/user/${encodeURIComponent(u)}/about.json`, {
      headers: { "User-Agent": "TRACE/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status !== 200) return { platform: "Reddit", found: false };
    const j = (await res.json()).data;
    return {
      platform: "Reddit", found: true, name: j.name, username: j.name,
      bio: j.subreddit?.public_description, avatar: j.icon_img?.split("?")[0],
      joinedAt: new Date(j.created_utc * 1000).toISOString(),
      url: `https://www.reddit.com/user/${u}`,
      extra: { linkKarma: j.link_karma, commentKarma: j.comment_karma, isGold: j.is_gold },
      fakeSignals: fakeHeuristics({ bio: j.subreddit?.public_description }),
    };
  } catch {
    return { platform: "Reddit", found: false };
  }
}

async function devto(u: string): Promise<SocialProfile> {
  try {
    const res = await fetch(`https://dev.to/api/users/by_username?url=${encodeURIComponent(u)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.status !== 200) return { platform: "Dev.to", found: false };
    const j = await res.json();
    return {
      platform: "Dev.to", found: true, name: j.name, username: j.username,
      bio: j.summary, avatar: j.profile_image, joinedAt: j.joined_at,
      url: `https://dev.to/${j.username}`,
      extra: { location: j.location, website: j.website_url, twitter: j.twitter_username, github: j.github_username },
    };
  } catch {
    return { platform: "Dev.to", found: false };
  }
}

async function medium(u: string): Promise<SocialProfile> {
  try {
    const res = await fetch(`https://medium.com/feed/@${encodeURIComponent(u)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { platform: "Medium", found: false };
    const xml = await res.text();
    const title = xml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
    const last = xml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    const posts = (xml.match(/<item>/g) ?? []).length;
    return {
      platform: "Medium", found: true, name: title, username: u,
      lastActivity: last, url: `https://medium.com/@${u}`,
      extra: { recentPosts: posts },
    };
  } catch {
    return { platform: "Medium", found: false };
  }
}

async function youtube(u: string): Promise<SocialProfile> {
  // Tanpa API key: cek halaman kanal publik
  try {
    const handle = u.startsWith("@") ? u : `@${u}`;
    const res = await fetch(`https://www.youtube.com/${handle}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status !== 200) return { platform: "YouTube", found: false };
    const html = await res.text();
    const subs = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/)?.[1];
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(" - YouTube", "");
    return {
      platform: "YouTube", found: true, name: title, username: handle,
      url: `https://www.youtube.com/${handle}`, extra: { subscribers: subs },
    };
  } catch {
    return { platform: "YouTube", found: false };
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(`social:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  let u = parsed.data.query.trim();
  // Terima URL profil juga
  const m = u.match(/(?:github\.com|reddit\.com\/user|dev\.to|medium\.com\/@|youtube\.com\/@?)\/([A-Za-z0-9._-]+)/);
  if (m) u = m[1];

  const data = await cached(`social:${u.toLowerCase()}`, 3600_000, async () => {
    const results = await Promise.allSettled([github(u), reddit(u), devto(u), medium(u), youtube(u)]);
    const profiles = results
      .filter((r): r is PromiseFulfilledResult<SocialProfile> => r.status === "fulfilled")
      .map((r) => r.value);
    return { username: u, profiles, foundCount: profiles.filter((p) => p.found).length };
  });

  return NextResponse.json({ success: true, data });
}
