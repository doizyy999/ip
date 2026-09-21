import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IMPORTANT_HEADERS = [
  "user-agent",
  "accept-language",
  "accept-encoding",
  "referer",
  "sec-ch-ua",
  "sec-ch-ua-platform",
  "sec-ch-ua-mobile",
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "cf-ipcountry",
  "via",
  "forwarded"
];

export async function GET(req: NextRequest) {
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  const realIp = h.get("x-real-ip");
  const xff = h.get("x-forwarded-for");

  // Prioritas: cf-connecting-ip > x-real-ip > x-forwarded-for[0]
  const ip =
    cf?.trim() ||
    realIp?.trim() ||
    xff?.split(",")[0]?.trim() ||
    "unknown";

  const headers: Record<string, string> = {};
  for (const key of IMPORTANT_HEADERS) {
    const v = h.get(key);
    if (v) headers[key] = v;
  }

  return NextResponse.json({
    ip,
    userAgent: h.get("user-agent") || "",
    headers
  });
}
