import { NextResponse } from "next/server";
import exifr from "exifr";
import { rateLimit, getIp } from "@/lib/rateLimit";
import type { ImageIntel } from "@/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const rl = rateLimit(`image:${getIp(req)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "Rate limit" }, { status: 429 });

  const contentType = req.headers.get("content-type") ?? "";
  let buffer: Buffer | null = null;
  let sourceUrl = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (file instanceof File) buffer = Buffer.from(await file.arrayBuffer());
  } else {
    const body = await req.json().catch(() => null);
    if (body?.url && typeof body.url === "string") {
      sourceUrl = body.url;
      const res = await fetch(body.url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
    }
  }

  if (!buffer) {
    return NextResponse.json({ success: false, error: "Tidak ada gambar valid" }, { status: 400 });
  }
  if (buffer.length > 20 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: "Maks 20MB" }, { status: 413 });
  }

  let exif: Record<string, unknown> = {};
  let gps: ImageIntel["gps"] = null;
  try {
    const parsed = (await exifr.parse(buffer, { gps: true })) as Record<string, unknown> | undefined;
    if (parsed) exif = parsed;
    const g = await exifr.gps(buffer).catch(() => null);
    if (g?.latitude && g?.longitude) gps = { lat: g.latitude, lng: g.longitude };
  } catch {
    // bukan format dengan EXIF
  }

  const interesting: Record<string, unknown> = {};
  for (const k of [
    "Make", "Model", "LensModel", "DateTimeOriginal", "CreateDate", "Software",
    "ISO", "FNumber", "ExposureTime", "FocalLength", "latitude", "longitude",
    "ImageWidth", "ImageHeight", "Orientation",
  ]) {
    if (exif[k] !== undefined) interesting[k] = String(exif[k]);
  }

  const stripped = Object.keys(interesting).length === 0;

  const reverse: ImageIntel["reverse"] = sourceUrl
    ? [
        { engine: "Google Lens", url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(sourceUrl)}` },
        { engine: "Yandex Images", url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(sourceUrl)}` },
        { engine: "TinEye", url: `https://tineye.com/search?url=${encodeURIComponent(sourceUrl)}` },
      ]
    : [{ engine: "Info", url: "Upload via URL untuk reverse search link" }];

  const data: ImageIntel = { exif: interesting, gps, stripped, reverse };
  return NextResponse.json({ success: true, data });
}
