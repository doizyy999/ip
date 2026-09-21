"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

// Tombol "🤖 Analisis AI" — ditaruh di tiap hasil modul
export function AiAnalyzeButton({
  type,
  data,
}: {
  type: "profile" | "timeline" | "graph";
  data: unknown;
}) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      const json = await res.json();
      if (json.success) setResult(json.data);
      else toast.error(json.error || "AI gagal");
    } catch {
      toast.error("Gagal menghubungi AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={analyze} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-1 h-4 w-4 text-cyber-purple" />
        )}
        🤖 Analisis AI
      </Button>
      {result && (
        <Card className="border-cyber-purple/40 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-sm text-cyber-purple">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="prose-sm prose-invert max-w-none text-sm text-zinc-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
            <ReactMarkdown>{result}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
