"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

export function MapView({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    // Fix icon default leaflet
    import("leaflet").then((L) => {
      // @ts-expect-error private field
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
    setReady(true);
  }, []);
  if (!ready) return <div className="h-96 animate-pulse rounded-lg bg-zinc-900" />;
  return (
    <MapContainer center={[lat, lng]} zoom={12} style={{ height: "400px", width: "100%", borderRadius: 12 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]}>{label && <Popup>{label}</Popup>}</Marker>
    </MapContainer>
  );
}
