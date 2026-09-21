import { NextRequest, NextResponse } from "next/server";
import { isValidDomain, isValidIP } from "@/lib/ipUtils";
import { PROVIDERS } from "@/lib/providers";
import type { ProviderResult, ProvidersResponse } from "@/types/ip";

export const revalidate = 3600; // literal, wajib — lihat catatan di lookup/route.ts

export async function GET(req: NextRequest) {
  const target = (req.nextUrl.searchParams.get("ip") || "").trim();

  if (!target) {
    return NextResponse.json({ error: "Parameter 'ip' wajib diisi." }, { status: 400 });
  }
  if (!isValidIP(target) && !isValidDomain(target)) {
    return NextResponse.json(
      { error: "Format bukan IPv4, IPv6, atau domain yang valid." },
      { status: 400 }
    );
  }

  const settled = await Promise.allSettled(PROVIDERS.map((p) => p.fetcher(target)));

  const providers: ProviderResult[] = settled.map((res, i) => {
    const name = PROVIDERS[i].name;
    if (res.status === "fulfilled") {
      return { name, result: res.value, error: null };
    }
    return {
      name,
      result: null,
      error: res.reason instanceof Error ? res.reason.message : "Lookup gagal."
    };
  });

  const okCount = providers.filter((p) => p.result).length;
  if (okCount === 0) {
    return NextResponse.json({ error: "Semua provider gagal melakukan lookup." }, { status: 502 });
  }

  const body: ProvidersResponse = { query: target, providers };
  return NextResponse.json(body);
}
