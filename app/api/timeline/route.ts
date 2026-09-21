import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";
import type { TimelineEvent } from "@/types";

const eventSchema = z.object({
  date: z.string(),
  category: z.string(),
  title: z.string().max(300),
  source: z.string(),
  url: z.string().url().optional(),
});

const schema = z.object({ events: z.array(eventSchema).max(500) });

// POST /api/timeline — merge, dedupe, sort event dari semua modul.
export async function POST(req: Request) {
  const rl = rateLimit(`timeline:${getIp(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const seen = new Set<string>();
  const events: TimelineEvent[] = [];
  for (const e of parsed.data.events) {
    const t = new Date(e.date).getTime();
    if (isNaN(t)) continue;
    const key = `${e.date}|${e.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push(e);
  }
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agregasi per bulan untuk chart
  const byMonth: Record<string, number> = {};
  for (const e of events) {
    const month = e.date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  }
  const chart = Object.entries(byMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({ success: true, data: { events, chart, total: events.length } });
}
