"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Share2, Monitor, Smartphone, Tablet, Bot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IPCard from "@/components/IPCard";
import IPCardSkeleton from "@/components/IPCardSkeleton";
import GPSLocator from "@/components/GPSLocator";
import { parseUserAgent } from "@/lib/userAgent";
import { copyToClipboard } from "@/lib/ipUtils";
import type { IPLookupResult, MyIPResponse, ParsedUserAgent } from "@/types/ip";

const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet, Bot: Bot, Unknown: Monitor };

export default function DashboardPage() {
  const [myip, setMyip] = useState<MyIPResponse | null>(null);
  const [lookup, setLookup] = useState<IPLookupResult | null>(null);
  const [ua, setUa] = useState<ParsedUserAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/myip", { cache: "no-store" });
      const data: MyIPResponse = await res.json();
      setMyip(data);
      setUa(parseUserAgent(data.userAgent));

      if (data.ip && data.ip !== "unknown") {
        const lres = await fetch(`/api/lookup?ip=${encodeURIComponent(data.ip)}`);
        if (lres.ok) setLookup(await lres.json());
        else setLookup(null);
      } else {
        setLookup(null);
      }
    } catch {
      toast.error("Gagal mendeteksi IP kamu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleShare() {
    if (!lookup) return;
    const text = `IPIntel — IP saya: ${lookup.query} | ${lookup.city || "?"}, ${lookup.country || "?"} | ISP: ${lookup.isp || "?"}`;
    const ok = await copyToClipboard(text);
    if (ok) toast.success("Ringkasan disalin — tinggal paste ke mana aja.");
    else toast.error("Gagal menyalin.");
  }

  const DeviceIcon = ua ? DEVICE_ICONS[ua.device] : Monitor;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My IP Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Deteksi otomatis IP publik & info browser kamu.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="secondary" onClick={handleShare} disabled={!lookup}>
            <Share2 className="h-4 w-4" />
            Share Hasil
          </Button>
        </div>
      </div>

      {loading ? (
        <IPCardSkeleton />
      ) : (
        <>
          {myip && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DeviceIcon className="h-4 w-4 text-primary" />
                  Perangkat & Browser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "IP Terdeteksi", value: myip.ip, mono: true },
                    { label: "Browser", value: ua ? `${ua.browser} ${ua.browserVersion}` : "-" },
                    { label: "OS", value: ua?.os || "-" },
                    { label: "Device", value: ua?.device || "-" }
                  ].map((f) => (
                    <div key={f.label} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                      <div className="text-xs text-muted-foreground">{f.label}</div>
                      <div className={`truncate text-sm ${f.mono ? "font-mono" : ""}`}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground">User Agent (mentah)</div>
                  <div className="break-all font-mono text-xs">{myip.userAgent || "N/A"}</div>
                </div>
                {Object.keys(myip.headers).length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Lihat HTTP headers ({Object.keys(myip.headers).length})
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs">
                      {JSON.stringify(myip.headers, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          )}

          {lookup ? (
            <IPCard data={lookup} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Geolokasi tidak tersedia (mungkin kamu di localhost / private IP).
                Deploy ke Vercel untuk hasil nyata.
              </CardContent>
            </Card>
          )}

          <GPSLocator />
        </>
      )}
    </div>
  );
}
