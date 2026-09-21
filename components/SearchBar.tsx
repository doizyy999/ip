"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { runOrchestration } from "@/lib/orchestrator";
import { addHistory, saveResult } from "@/lib/store";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const router = useRouter();

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return toast.error("Minimal 2 karakter");
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const result = await runOrchestration(base, q, (m) => setProgress(`Scanning ${m}...`));
      saveResult(result.id, result);
      addHistory({ id: result.id, query: q, type: result.type, createdAt: result.createdAt });
      router.push(`/result/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan gagal");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <form onSubmit={onSearch} className="w-full">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="username / email@x.com / +62812... / domain.com"
          className="h-12 font-mono"
          disabled={loading}
        />
        <Button type="submit" className="h-12 px-6" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">{loading ? "Scanning" : "Trace"}</span>
        </Button>
      </div>
      {progress && (
        <p className="mt-2 font-mono text-xs text-cyber-cyan">{progress}</p>
      )}
    </form>
  );
}
