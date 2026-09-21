"use client";

import { useState } from "react";
import { Smartphone, ShieldCheck, ShieldAlert, ExternalLink, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IMEICheckResult } from "@/types/ip";

export default function IMEIChecker() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IMEICheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleaned = value.replace(/[\s-]/g, "");
    if (!/^\d{15}$/.test(cleaned)) {
      setError("IMEI harus 15 digit angka. Cek di HP: dial *#06# atau Setelan > Tentang Ponsel.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/imei-check?imei=${encodeURIComponent(cleaned)}`);
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Cek IMEI gagal.");
        return;
      }
      setResult(body as IMEICheckResult);
    } catch {
      toast.error("Network error — cek koneksi kamu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="mis. 356938035643809 (15 digit — cek dengan *#06#)"
            className="h-12 font-mono text-base"
            aria-label="Nomor IMEI"
          />
          <Button type="submit" size="lg" className="h-12 px-6" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Cek IMEI
          </Button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 font-mono text-lg">
                <Smartphone className="h-5 w-5 text-primary" />
                {result.raw}
              </CardTitle>
              <Badge variant={result.luhnValid ? "success" : "danger"}>
                {result.luhnValid ? (
                  <ShieldCheck className="mr-1 h-3 w-3" />
                ) : (
                  <ShieldAlert className="mr-1 h-3 w-3" />
                )}
                Checksum {result.luhnValid ? "Valid" : "Tidak Valid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: "TAC (Type Allocation Code)", value: result.tac },
                { label: "Kode Badan Sertifikasi", value: result.reportingBodyId },
                { label: "Nomor Seri", value: result.serialNumber },
                { label: "Check Digit", value: result.checkDigit },
                { label: "Brand", value: result.brand || "Tidak diketahui" },
                { label: "Model", value: result.model || "Tidak diketahui" }
              ].map((f) => (
                <div key={f.label} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="truncate font-mono text-sm">{f.value}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">{result.lookupNote}</p>

            {!result.luhnValid && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                Checksum tidak valid — kemungkinan IMEI salah ketik, atau perangkat pakai IMEI
                palsu/di-clone (umum pada HP black market / curian yang di-reflash).
              </div>
            )}

            <a
              href={result.kemenperinCheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Cek status terdaftar resmi di Kemenperin
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Tentang fitur ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Cek IMEI di sini memvalidasi <strong>format & checksum</strong> nomor IMEI (akurat
            100%, dihitung langsung, bukan tebakan), plus info TAC (kode identitas
            brand/model yang diterbitkan GSMA).
          </p>
          <p>
            Fitur ini <strong>tidak bisa</strong> menunjukkan lokasi perangkat. Untuk HP
            hilang/dicuri, gunakan Google Find My Device / Apple Find My (kalau masih aktif),
            atau laporkan ke polisi + operator seluler untuk pemblokiran IMEI resmi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
