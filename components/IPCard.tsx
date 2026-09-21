"use client";

import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Copy, ShieldAlert, ShieldCheck, MapPin, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard, flagUrl, formatBool } from "@/lib/ipUtils";
import type { IPLookupResult } from "@/types/ip";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Field {
  label: string;
  value?: string | number;
  mono?: boolean;
}

export default function IPCard({ data }: { data: IPLookupResult }) {
  const handleCopy = async (value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) toast.success(`Disalin: ${value}`);
    else toast.error("Gagal menyalin ke clipboard");
  };

  const fields: Field[] = [
    { label: "IP Address", value: data.query, mono: true },
    { label: "ISP", value: data.isp },
    { label: "ASN", value: data.as, mono: true },
    { label: "Organisasi", value: data.org },
    { label: "Negara", value: data.country ? `${data.country} (${data.countryCode})` : undefined },
    { label: "Region", value: data.regionName || data.region },
    { label: "Kota", value: data.city },
    { label: "Kode Pos", value: data.zip, mono: true },
    { label: "Koordinat", value: data.lat !== undefined ? `${data.lat}, ${data.lon}` : undefined, mono: true },
    { label: "Timezone", value: data.timezone, mono: true },
    { label: "Mata Uang", value: data.currency },
    { label: "Reverse DNS", value: data.reverse, mono: true },
    { label: "Sumber Data", value: data.source }
  ];

  const flags = [
    { label: "VPN / Proxy", active: !!data.proxy },
    { label: "Hosting / Datacenter", active: !!data.hosting },
    { label: "Mobile Network", active: !!data.mobile }
  ];

  const flag = flagUrl(data.countryCode);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 font-mono text-xl">
            <Network className="h-5 w-5 text-primary" />
            {data.query}
            {flag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flag} alt={data.countryCode} className="h-5 rounded-sm" />
            )}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge key={f.label} variant={f.active ? "danger" : "success"}>
                {f.active ? <ShieldAlert className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
                {f.label}: {f.active ? "Yes" : "No"}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {fields.map((f) => (
            <button
              key={f.label}
              onClick={() => f.value !== undefined && handleCopy(String(f.value))}
              className="group flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-left transition-colors hover:border-primary/50"
              title="Klik untuk menyalin"
            >
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <div className={`truncate text-sm ${f.mono ? "font-mono" : ""}`}>
                  {f.value ?? <span className="text-muted-foreground">N/A</span>}
                </div>
              </div>
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {data.lat !== undefined && data.lon !== undefined && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Perkiraan Lokasi (akurasi level kota)
            </div>
            <MapView lat={data.lat} lon={data.lon} label={`${data.city || ""}, ${data.country || ""}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
