import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { isNumeric15, parseIMEI } from "@/lib/imeiUtils";
import type { IMEICheckResult } from "@/types/ip";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("imei") || "").trim();

  if (!raw) {
    return NextResponse.json({ error: "Parameter 'imei' wajib diisi." }, { status: 400 });
  }

  const cleaned = raw.replace(/[\s-]/g, "");
  if (!isNumeric15(cleaned)) {
    return NextResponse.json(
      { error: "IMEI harus 15 digit angka (boleh pakai spasi/strip sebagai pemisah)." },
      { status: 400 }
    );
  }

  const parsed = parseIMEI(cleaned);

  let brand: string | undefined;
  let model: string | undefined;
  let lookupNote: string;

  // Brand/model lookup butuh database TAC resmi (GSMA) yang biasanya di balik API
  // berbayar pihak ketiga. Kalau kamu punya API key dari provider TAC-lookup
  // (mis. imei.info, IMEICheck.net, dll), set IMEI_LOOKUP_API_URL & IMEI_LOOKUP_API_KEY
  // di environment variables Vercel, dan hasilnya otomatis muncul di sini.
  const lookupUrl = process.env.IMEI_LOOKUP_API_URL;
  const lookupKey = process.env.IMEI_LOOKUP_API_KEY;

  if (lookupUrl && lookupKey) {
    try {
      const { data } = await axios.get(lookupUrl, {
        params: { imei: cleaned, key: lookupKey },
        timeout: 8000
      });
      brand = data.brand || data.manufacturer;
      model = data.model || data.name;
      lookupNote = brand || model ? "Data dari provider TAC-lookup eksternal." : "Provider tidak mengembalikan data model.";
    } catch {
      lookupNote = "Lookup brand/model ke provider eksternal gagal (cek API key/kuota).";
    }
  } else {
    lookupNote =
      "Brand/model lookup belum dikonfigurasi — butuh API key provider TAC-database pihak ketiga. Checksum & validitas format tetap akurat tanpa API key.";
  }

  const body: IMEICheckResult = {
    ...parsed,
    brand,
    model,
    lookupNote,
    kemenperinCheckUrl: "https://imei.kemenperin.go.id/"
  };

  return NextResponse.json(body);
}
