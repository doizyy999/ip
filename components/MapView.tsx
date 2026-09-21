"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon (issue umum Leaflet + bundler)
const icon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#06b6d4;border:3px solid #8b5cf6;box-shadow:0 0 12px #06b6d4;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

interface MapViewProps {
  lat: number;
  lon: number;
  label?: string;
}

export default function MapView({ lat, lon, label }: MapViewProps) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: 280, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]} icon={icon}>
        <Popup>{label || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</Popup>
      </Marker>
    </MapContainer>
  );
}
