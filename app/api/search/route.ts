import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { detectType } from "@/lib/utils";

const schema = z.object({ query: z.string().min(2).max(200) });

// POST /api/search → validasi + deteksi tipe + daftar modul yang akan jalan
export async function POST(req: Request) {
  const rl = rateLimit(`search:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Rate limit. Coba lagi nanti.", retryAfter: rl.retryAfter },
      { status: 429 }
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }
  const query = parsed.data.query.trim();
  const type = detectType(query);
  const modules =
    type === "username" ? ["username", "social", "public-records"]
    : type === "email" ? ["email", "public-records"]
    : type === "phone" ? ["phone"]
    : ["domain", "public-records"];
  return NextResponse.json({ success: true, data: { query, type, modules } });
}
