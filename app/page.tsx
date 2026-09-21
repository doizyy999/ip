"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LookupForm from "@/components/LookupForm";
import IPCard from "@/components/IPCard";
import IPCardSkeleton from "@/components/IPCardSkeleton";
import HistoryList from "@/components/HistoryList";
import ProviderCompareTable from "@/components/ProviderCompareTable";
import type { IPLookupResult, ProvidersResponse } from "@/types/ip";

export default function HomePage() {
  const [result, setResult] = useState<IPLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);

  async function handleCompareProviders() {
    if (!result) return;
    setProvidersLoading(true);
    setProviders(null);
    try {
      const res = await fetch(`/api/providers?ip=${encodeURIComponent(result.query)}`);
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Gagal membandingkan provider.");
        return;
      }
      setProviders(body as ProvidersResponse);
    } catch {
      toast.error("Network error — cek koneksi kamu.");
    } finally {
      setProvidersLoading(false);
    }
  }

  function handleResult(data: IPLookupResult) {
    setResult(data);
    setProviders(null);
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 pt-6 text-center"
      >
        <h1 className="bg-cyber-gradient bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          IP Intelligence Lookup
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Masukkan IP address atau domain untuk melihat geolokasi, ISP, ASN, dan deteksi
          VPN / Proxy / Hosting. Tool edukasi — bukan untuk tracking orang.
        </p>
      </motion.section>

      <div className="mx-auto max-w-2xl">
        <LookupForm onResult={handleResult} onLoading={setLoading} />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {loading && <IPCardSkeleton />}
        {!loading && result && (
          <>
            <IPCard data={result} />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleCompareProviders} disabled={providersLoading}>
                {providersLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitCompareArrows className="h-4 w-4" />
                )}
                Bandingkan Semua Provider
              </Button>
              <p className="text-xs text-muted-foreground">
                Cek konsistensi lokasi antar sumber data — kalau beda, itu indikasi akurasi
                rendah di area ini.
              </p>
            </div>
            {providers && <ProviderCompareTable data={providers} />}
          </>
        )}
        <HistoryList onSelect={handleResult} />
      </div>
    </div>
  );
}
