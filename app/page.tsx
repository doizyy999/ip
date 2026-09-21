"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LookupForm from "@/components/LookupForm";
import IPCard from "@/components/IPCard";
import IPCardSkeleton from "@/components/IPCardSkeleton";
import HistoryList from "@/components/HistoryList";
import type { IPLookupResult } from "@/types/ip";

export default function HomePage() {
  const [result, setResult] = useState<IPLookupResult | null>(null);
  const [loading, setLoading] = useState(false);

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
        <LookupForm onResult={setResult} onLoading={setLoading} />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {loading && <IPCardSkeleton />}
        {!loading && result && <IPCard data={result} />}
        <HistoryList onSelect={setResult} />
      </div>
    </div>
  );
}
