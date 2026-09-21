"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBool } from "@/lib/ipUtils";
import type { CompareResult } from "@/types/ip";

const ROWS: { key: keyof CompareResult["diff"] | null; label: string; get: (r: CompareResult["results"][0]) => string | undefined }[] = [
  { key: null, label: "IP Address", get: (r) => r.query },
  { key: "country", label: "Negara", get: (r) => r.country },
  { key: "city", label: "Kota", get: (r) => r.city },
  { key: null, label: "Region", get: (r) => r.regionName },
  { key: "isp", label: "ISP", get: (r) => r.isp },
  { key: null, label: "ASN", get: (r) => r.as },
  { key: null, label: "Organisasi", get: (r) => r.org },
  { key: null, label: "Timezone", get: (r) => r.timezone },
  { key: null, label: "Koordinat", get: (r) => (r.lat !== undefined ? `${r.lat}, ${r.lon}` : undefined) },
  { key: null, label: "Reverse DNS", get: (r) => r.reverse },
  { key: "hosting", label: "Hosting", get: (r) => formatBool(r.hosting) },
  { key: "proxy", label: "VPN / Proxy", get: (r) => formatBool(r.proxy) },
  { key: "mobile", label: "Mobile", get: (r) => formatBool(r.mobile) }
];

export default function CompareTable({ data }: { data: CompareResult }) {
  const [a, b] = data.results;

  return (
    <Card className="animate-fade-in overflow-x-auto">
      <CardHeader>
        <CardTitle className="text-base">Hasil Perbandingan</CardTitle>
        <div className="flex gap-2 pt-1 text-xs text-muted-foreground">
          <Badge variant="secondary">Kolom ungu = nilai berbeda</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 text-muted-foreground">Field</th>
              <th className="py-2 pr-4 font-mono text-primary">{a.query}</th>
              <th className="py-2 font-mono text-secondary">{b.query}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const isDiff = row.key ? data.diff[row.key] : false;
              return (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  <td className={cn("py-2 pr-4 font-mono text-xs sm:text-sm", isDiff && "rounded bg-secondary/15 text-secondary")}>
                    {a.status === "fail" ? a.message || "Gagal" : row.get(a) ?? "N/A"}
                  </td>
                  <td className={cn("py-2 font-mono text-xs sm:text-sm", isDiff && "rounded bg-secondary/15 text-secondary")}>
                    {b.status === "fail" ? b.message || "Gagal" : row.get(b) ?? "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
