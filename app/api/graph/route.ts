import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";
import type { GraphData } from "@/types";

const schema = z.object({
  query: z.string().min(1).max(200),
  nodes: z.array(z.object({ id: z.string(), label: z.string(), group: z.string() })).optional(),
  links: z.array(z.object({ source: z.string(), target: z.string(), label: z.string().optional() })).optional(),
});

// POST /api/graph — normalisasi data graph dari hasil modul lain.
// Client mengirim hasil scan; server merapikan jadi format force-graph.
export async function POST(req: Request) {
  const rl = rateLimit(`graph:${getIp(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });

  const { query, nodes = [], links = [] } = parsed.data;
  const seen = new Set<string>();
  const cleanNodes = [{ id: "root", label: query, group: "target" }];
  for (const n of nodes) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      cleanNodes.push(n);
    }
  }
  const nodeIds = new Set(cleanNodes.map((n) => n.id));
  const cleanLinks = links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

  const data: GraphData = { nodes: cleanNodes, links: cleanLinks };
  return NextResponse.json({ success: true, data });
}
