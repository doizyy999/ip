import { NextRequest, NextResponse } from "next/server";
import { isValidDomain, isValidIP } from "@/lib/ipUtils";
import { fetchIpApi, fetchIpInfo } from "@/lib/providers";

export const revalidate = 3600; // cache 1 jam (harus literal, tidak boleh dari variabel import)

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

  try {
    const result = await fetchIpApi(target);
    return NextResponse.json(result);
  } catch (primaryErr) {
    try {
      const result = await fetchIpInfo(target);
      return NextResponse.json(result);
    } catch (fallbackErr) {
      const msg =
        fallbackErr instanceof Error ? fallbackErr.message : "Lookup gagal dari kedua sumber.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }
}
