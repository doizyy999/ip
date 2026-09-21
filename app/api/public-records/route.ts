import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { cached } from "@/lib/cache";
import type { PublicRecord } from "@/types";

const schema = z.object({ query: z.string().min(2).max(200) });

function parseRssItems(xml: string, source: string): PublicRecord[] {
  const items: PublicRecord[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const m of matches) {
    const item = m[1];
    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    if (title && link) items.push({ source, title, url: link, date: pubDate });
    if (items.length >= 10) break;
  }
  return items;
}

export async function POST(req: Request) {
  const rl = rateLimit(`records:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const q = parsed.data.query.trim();
  const enc = encodeURIComponent(q);

  const data = await cached(`records:${q.toLowerCase()}`, 3600_000, async () => {
    const records: PublicRecord[] = [];

    // Google News RSS (publik)
    try {
      const res = await fetch(
        `https://news.google.com/rss/search?q=${enc}&hl=id&gl=ID&ceid=ID:id`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) records.push(...parseRssItems(await res.text(), "Google News"));
    } catch { /* ignore */ }

    // Direktori publik Indonesia — link pencarian langsung (manual verify)
    records.push(
      { source: "AHU Online", title: `Cek direktori perusahaan/badan hukum: ${q}`, url: "https://ahu.go.id/pencarian/profil-pt", summary: "Direktori resmi badan hukum Kemenkumham" },
      { source: "OSS RBA", title: `Cek izin berusaha: ${q}`, url: "https://oss.go.id/informasi/kbli-berbasis-risiko", summary: "Perizinan berusaha berbasis risiko" },
      { source: "Putusan MA", title: `Cari putusan pengadilan: ${q}`, url: `https://putusan3.mahkamahagung.go.id/search.html?q=${enc}`, summary: "Direktori putusan Mahkamah Agung" },
      { source: "SIPP", title: `Cari perkara: ${q}`, url: "https://sipp.pn-jakartaselatan.go.id/", summary: "Sistem Informasi Penelusuran Perkara" },
      { source: "LKPM", title: `Laporan penanaman modal: ${q}`, url: "https://bkpm.go.id/", summary: "Kementerian Investasi/BKPM" },
      { source: "DJKI", title: `Cek merek/HKI: ${q}`, url: "https://pdki-indonesia.dgip.go.id/", summary: "Pangkalan Data Kekayaan Intelektual" },
    );

    return { query: q, records };
  });

  return NextResponse.json({ success: true, data });
}
