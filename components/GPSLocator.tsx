"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GeoAddress } from "@/types/ip";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Status = "idle" | "asking" | "geocoding" | "done" | "error";

export default function GPSLocator() {
  const [status, setStatus] = useState<Status>("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [address, setAddress] = useState<GeoAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleActivate() {
    if (!("geolocation" in navigator)) {
      toast.error("Browser kamu tidak mendukung Geolocation API.");
      return;
    }
    setStatus("asking");
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lon: longitude, accuracy });
        setStatus("geocoding");
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const body = await res.json();
          if (!res.ok) throw new Error(body.error || "Reverse geocode gagal.");
          setAddress(body as GeoAddress);
          setStatus("done");
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : "Reverse geocode gagal.");
          setStatus("error");
        }
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk pakai fitur ini."
            : "Gagal mendapat lokasi GPS: " + err.message
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LocateFixed className="h-4 w-4 text-primary" />
          Lokasi GPS Presisi Tinggi
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Beda dari IP geolocation (akurasi kota) — ini pakai GPS perangkatmu sendiri lewat izin
          browser, bisa sampai level jalan/kelurahan. Hanya berlaku untuk perangkat yang kamu
          pakai sekarang, bukan untuk melacak IP atau orang lain.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && (
          <Button onClick={handleActivate}>
            <Crosshair className="h-4 w-4" />
            Aktifkan GPS
          </Button>
        )}

        {(status === "asking" || status === "geocoding") && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status === "asking" ? "Menunggu izin lokasi dari browser..." : "Menerjemahkan koordinat ke alamat..."}
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-red-400">{errorMsg}</p>
            <Button variant="outline" onClick={handleActivate}>
              <Crosshair className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        )}

        {status === "done" && coords && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Akurasi ±{Math.round(coords.accuracy)} m</Badge>
              <Badge variant="secondary" className="font-mono">
                {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </Badge>
            </div>

            {address && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "Jalan", value: [address.road, address.houseNumber].filter(Boolean).join(" ") },
                  { label: "Lingkungan", value: address.neighbourhood },
                  { label: "Kelurahan / Desa", value: address.suburb || address.village },
                  { label: "Kecamatan", value: address.cityDistrict },
                  { label: "Kota / Kabupaten", value: address.city || address.county },
                  { label: "Provinsi", value: address.state },
                  { label: "Kode Pos", value: address.postcode },
                  { label: "Negara", value: address.country }
                ].map((f) => (
                  <div key={f.label} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                    <div className="text-xs text-muted-foreground">{f.label}</div>
                    <div className="truncate text-sm">
                      {f.value || <span className="text-muted-foreground">Tidak tersedia</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <MapView lat={coords.lat} lon={coords.lon} label="Lokasi GPS kamu" />

            <p className="text-xs text-muted-foreground">
              Sumber alamat: OpenStreetMap Nominatim. Detail RT/RW tidak tersedia di data publik
              manapun — level paling detail yang bisa didapat dari GPS + reverse geocoding
              biasanya kelurahan/jalan, kecuali di area yang datanya sangat lengkap di OSM.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
