"use client";

import { useState } from "react";
import { GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CompareTable from "@/components/CompareTable";
import { validateTarget } from "@/lib/ipUtils";
import type { CompareResult } from "@/types/ip";

export default function ComparePage() {
  const [ip1, setIp1] = useState("");
  const [ip2, setIp2] = useState("");
  const [errors, setErrors] = useState<{ ip1?: string; ip2?: string }>({});
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    const v1 = validateTarget(ip1);
    const v2 = validateTarget(ip2);
    const errs: typeof errors = {};
    if (!v1.valid) errs.ip1 = v1.error;
    if (!v2.valid) errs.ip2 = v2.error;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/compare?ip1=${encodeURIComponent(ip1.trim())}&ip2=${encodeURIComponent(ip2.trim())}`
      );
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Compare gagal.");
        return;
      }
      setResult(body as CompareResult);
    } catch {
      toast.error("Network error — cek koneksi kamu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compare IP</h1>
        <p className="text-sm text-muted-foreground">
          Bandingkan dua IP side-by-side. Perbedaan negara, ISP, dan tipe koneksi di-highlight.
        </p>
      </div>

      <form onSubmit={handleCompare} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Input
              value={ip1}
              onChange={(e) => setIp1(e.target.value)}
              placeholder="IP / domain pertama — mis. 8.8.8.8"
              className="h-11"
            />
            {errors.ip1 && <p className="mt-1 text-xs text-red-400">{errors.ip1}</p>}
          </div>
          <div>
            <Input
              value={ip2}
              onChange={(e) => setIp2(e.target.value)}
              placeholder="IP / domain kedua — mis. 1.1.1.1"
              className="h-11"
            />
            {errors.ip2 && <p className="mt-1 text-xs text-red-400">{errors.ip2}</p>}
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          <GitCompareArrows className="h-4 w-4" />
          {loading ? "Membandingkan..." : "Bandingkan"}
        </Button>
      </form>

      {loading && (
        <Card>
          <CardContent className="space-y-2 py-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {result && !loading && <CompareTable data={result} />}
    </div>
  );
}
