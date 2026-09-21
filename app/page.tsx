"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { getHistory, type HistoryEntry } from "@/lib/store";
import {
  AtSign,
  Mail,
  Phone,
  Globe,
  Image as ImageIcon,
  Building2,
  Share2,
  Network,
  Clock,
  Bot,
} from "lucide-react";

const MODULES = [
  { icon: AtSign, name: "Username Scanner", desc: "150+ platform, parallel fetch, deteksi status HTTP" },
  { icon: Mail, name: "Email Intelligence", desc: "MX record, disposable check, Gravatar, GitHub commits" },
  { icon: Phone, name: "Phone Intelligence", desc: "E.164 parse, negara, tipe, link WhatsApp/Telegram" },
  { icon: Globe, name: "Domain Inspector", desc: "WHOIS, DNS, subdomain crt.sh, SSL, tech stack" },
  { icon: ImageIcon, name: "Image Metadata", desc: "EXIF, GPS ke peta, reverse image search" },
  { icon: Building2, name: "Public Records", desc: "AHU, OSS, putusan MA, berita publik" },
  { icon: Share2, name: "Social Scanner", desc: "GitHub, Reddit, Dev.to, Medium via API resmi" },
  { icon: Network, name: "Relationship Graph", desc: "Force-directed graph interaktif" },
  { icon: Clock, name: "Timeline Builder", desc: "Gabungan semua aktivitas publik + chart" },
  { icon: Bot, name: "AI Assistant", desc: "Groq LLM: analisis, red flag, laporan otomatis" },
];

export default function HomePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => setHistory(getHistory().slice(0, 5)), []);

  return (
    <div className="cyber-grid">
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-5xl font-bold tracking-widest text-cyber-cyan glow-cyan md:text-7xl"
        >
          TRACE
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl text-zinc-400"
        >
          Public information aggregator &amp; digital footprint analyzer. Satu input —
          username, email, phone, atau domain — kumpulkan semua jejak digital publik.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-2xl"
        >
          <SearchBar />
        </motion.div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="h-full border-zinc-800 bg-zinc-900/60 transition hover:border-cyber-cyan/50">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <m.icon className="h-5 w-5 text-cyber-purple" />
                <CardTitle className="text-sm text-zinc-100">{m.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-500">{m.desc}</CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-mono text-sm tracking-widest text-zinc-500">
            RECENT SCANS
          </h2>
          <div className="space-y-2">
            {history.map((h) => (
              <Link
                key={h.id}
                href={`/result/${h.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm transition hover:border-cyber-cyan/50"
              >
                <span className="font-mono text-cyber-cyan">{h.query}</span>
                <span className="text-xs text-zinc-500">
                  {h.type} · {new Date(h.createdAt).toLocaleString("id-ID")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
