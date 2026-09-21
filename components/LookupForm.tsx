"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateTarget } from "@/lib/ipUtils";
import { useLookupStore } from "@/lib/store";
import type { IPLookupResult } from "@/types/ip";

interface LookupFormProps {
  onResult: (data: IPLookupResult) => void;
  onLoading: (loading: boolean) => void;
}

export default function LookupForm({ onResult, onLoading }: LookupFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addHistory = useLookupStore((s) => s.addHistory);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const check = validateTarget(value);
    if (!check.valid) {
      setError(check.error || "Input tidak valid.");
      return;
    }

    const target = value.trim();
    onLoading(true);
    try {
      const res = await fetch(`/api/lookup?ip=${encodeURIComponent(target)}`);
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Lookup gagal.");
        onLoading(false);
        return;
      }
      onResult(body as IPLookupResult);
      addHistory(target, body as IPLookupResult);
    } catch {
      toast.error("Network error — cek koneksi kamu.");
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="8.8.8.8 / 2001:4860:4860::8888 / google.com"
          className="h-12 text-base"
          aria-label="IP address atau domain"
        />
        <Button type="submit" size="lg" className="h-12 px-6">
          <Search className="h-4 w-4" />
          Lookup
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
