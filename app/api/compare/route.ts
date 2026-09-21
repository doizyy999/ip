import { NextRequest, NextResponse } from "next/server";
import { isValidDomain, isValidIP } from "@/lib/ipUtils";
import type { CompareResult, IPLookupResult } from "@/types/ip";

export const revalidate = 3600;

async function lookup(baseUrl: string, target: string): Promise<IPLookupResult> {
  const res = await fetch(`${baseUrl}/api/lookup?ip=${encodeURIComponent(target)}`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { query: target, status: "fail", message: body.error || "Lookup gagal" };
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  const ip1 = (req.nextUrl.searchParams.get("ip1") || "").trim();
  const ip2 = (req.nextUrl.searchParams.get("ip2") || "").trim();

  for (const [name, val] of [["ip1", ip1], ["ip2", ip2]] as const) {
    if (!val) return NextResponse.json({ error: `Parameter '${name}' wajib diisi.` }, { status: 400 });
    if (!isValidIP(val) && !isValidDomain(val)) {
      return NextResponse.json({ error: `'${name}' bukan IP/domain valid.` }, { status: 400 });
    }
  }

  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  // 2 lookup paralel
  const [r1, r2] = await Promise.all([lookup(baseUrl, ip1), lookup(baseUrl, ip2)]);

  const body: CompareResult = {
    results: [r1, r2],
    diff: {
      country: r1.country !== r2.country,
      isp: r1.isp !== r2.isp,
      city: r1.city !== r2.city,
      hosting: r1.hosting !== r2.hosting,
      proxy: r1.proxy !== r2.proxy,
      mobile: r1.mobile !== r2.mobile
    }
  };

  return NextResponse.json(body);
}
