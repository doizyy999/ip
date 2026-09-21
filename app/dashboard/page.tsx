"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setHistory(getHistory()), []);

  async function aiInsight() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", data: history.slice(0, 20) }),
      });
      const json = await res.json();
      if (json.success) setInsight(json.data);
      else toast.error(json.error || "AI gagal");
    } catch {
      toast.error("Gagal menghubungi AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold tracking-widest text-cyber-cyan">
          DASHBOARD
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={aiInsight}
            disabled={loading || history.length === 0}
          >
            <Sparkles className="mr-1 h-4 w-4 text-cyber-purple" />
            {loading ? "Menganalisis..." : "AI Insight"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearHistory();
              setHistory([]);
              toast.success("History dihapus");
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      {insight && (
        <Card className="border-cyber-purple/40 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-sm text-cyber-purple">AI Insight</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-zinc-300">
            {insight}
          </CardContent>
        </Card>
      )}

      {history.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Belum ada history. Lakukan scan dari{" "}
          <Link href="/" className="text-cyber-cyan underline">
            homepage
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant="cyan">{h.type}</Badge>
                <span className="font-mono text-sm text-zinc-200">{h.query}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {new Date(h.createdAt).toLocaleString("id-ID")}
                </span>
                <Link href={`/result/${h.id}`}>
                  <ExternalLink className="h-4 w-4 text-cyber-cyan" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
