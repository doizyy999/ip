"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProvidersResponse, IPLookupResult } from "@/types/ip";

const ROWS: { label: string; get: (r: IPLookupResult) => string | undefined }[] = [
  { label: "Negara", get: (r) => r.country },
  { label: "Region", get: (r) => r.regionName || r.region },
  { label: "Kota", get: (r) => r.city },
  { label: "Kode Pos", get: (r) => r.zip },
  { label: "Koordinat", get: (r) => (r.lat !== undefined ? `${r.lat}, ${r.lon}` : undefined) },
  { label: "ISP / Org", get: (r) => r.isp || r.org },
  { label: "ASN", get: (r) => r.as },
  { label: "Timezone", get: (r) => r.timezone }
];

export default function ProviderCompareTable({ data }: { data: ProvidersResponse }) {
  const ok = data.providers.filter((p) => p.result);
  const allSameCity =
    ok.length > 1 && ok.every((p) => p.result!.city === ok[0].result!.city);

  return (
    <Card className="animate-fade-in overflow-x-auto">
      <CardHeader>
        <CardTitle className="text-base">Cross-check Antar Provider</CardTitle>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
          <Badge variant={allSameCity ? "success" : "danger"}>
            {allSameCity ? "Provider sepakat soal kota" : "Provider tidak sepakat — indikasi akurasi rendah"}
          </Badge>
          <Badge variant="secondary">Kolom kuning = nilai berbeda antar provider</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 text-muted-foreground">Field</th>
              {data.providers.map((p) => (
                <th key={p.name} className="py-2 pr-4 font-mono text-primary">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = data.providers.map((p) => (p.result ? row.get(p.result) : undefined));
              const distinct = new Set(values.filter(Boolean)).size;
              const isDiff = distinct > 1;
              return (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  {data.providers.map((p, i) => (
                    <td
                      key={p.name}
                      className={cn(
                        "py-2 pr-4 font-mono text-xs sm:text-sm",
                        isDiff && "rounded bg-yellow-500/15 text-yellow-400"
                      )}
                    >
                      {p.result ? values[i] ?? "N/A" : p.error || "Gagal"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted-foreground">
          Kalau kota/koordinat berbeda antar provider, itu tanda akurasi lokasi memang rendah di
          area ini — bukan bug. Akurasi IP geolocation memang dibatasi sampai level kota.
        </p>
      </CardContent>
    </Card>
  );
}
