import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import type { GeoAddress } from "@/types/ip";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// Reverse geocoding via Nominatim (OpenStreetMap) — gratis, tapi wajib User-Agent
// sesuai usage policy mereka. Hanya dipakai untuk koordinat GPS milik user sendiri
// (dikirim dari browser dengan izin eksplisit), bukan untuk melacak IP/orang lain.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!lat || !lon || isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json({ error: "Parameter 'lat' dan 'lon' wajib diisi angka valid." }, { status: 400 });
  }
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return NextResponse.json({ error: "Koordinat di luar rentang valid." }, { status: 400 });
  }

  try {
    const { data } = await axios.get(NOMINATIM_URL, {
      params: {
        format: "jsonv2",
        lat: latNum,
        lon: lonNum,
        zoom: 18, // level tertinggi Nominatim: setara jalan/gedung
        addressdetails: 1
      },
      headers: {
        // Nominatim mewajibkan identifikasi aplikasi yang jelas
        "User-Agent": "IPIntel-Educational/1.0 (contact: via GitHub repo)"
      },
      timeout: 8000
    });

    const addr = data.address || {};
    const body: GeoAddress = {
      displayName: data.display_name,
      road: addr.road,
      houseNumber: addr.house_number,
      neighbourhood: addr.neighbourhood || addr.hamlet,
      village: addr.village,
      suburb: addr.suburb, // kelurahan/desa, tergantung mapping OSM
      cityDistrict: addr.city_district || addr.district, // kecamatan
      city: addr.city || addr.town || addr.municipality,
      county: addr.county,
      state: addr.state,
      postcode: addr.postcode,
      country: addr.country,
      countryCode: addr.country_code?.toUpperCase()
    };

    return NextResponse.json(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Reverse geocode gagal.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
