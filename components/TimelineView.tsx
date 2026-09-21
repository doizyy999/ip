"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { TimelineEvent } from "@/types";
import { fmtDate } from "@/lib/utils";

const CATEGORIES = ["all", "platform", "post", "commit", "news", "legal", "other"];

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [chart, setChart] = useState<{ month: string; count: number }[]>([]);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (cat !== "all" && e.category !== cat) return false;
        if (from && e.date < from) return false;
        if (to && e.date > to) return false;
        return true;
      }),
    [events, cat, from, to]
  );

  useEffect(() => {
    fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: filtered }),
    })
      .then((r) => r.json())
      .then((j) => j.success && setChart(j.data.chart))
      .catch(() => {});
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              cat === c
                ? "border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan"
                : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {c}
          </button>
        ))}
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-36 text-xs" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-36 text-xs" />
      </div>

      {chart.length > 0 && (
        <div className="h-56 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <ol className="relative space-y-3 border-l border-zinc-800 pl-5">
        {filtered.length === 0 && <p className="text-sm text-zinc-500">Tidak ada event.</p>}
        {filtered.map((e, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-cyber-cyan bg-zinc-950" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-cyber-cyan">{fmtDate(e.date)}</span>
              <Badge variant="purple">{e.category}</Badge>
              <span className="text-xs text-zinc-500">{e.source}</span>
            </div>
            {e.url ? (
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-200 hover:text-cyber-cyan">
                {e.title}
              </a>
            ) : (
              <p className="text-sm text-zinc-200">{e.title}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
