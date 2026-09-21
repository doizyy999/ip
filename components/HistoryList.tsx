"use client";

import { History, Trash2 } from "lucide-react";
import { useLookupStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IPLookupResult } from "@/types/ip";
import { useEffect, useState } from "react";

interface HistoryListProps {
  onSelect: (result: IPLookupResult) => void;
}

export default function HistoryList({ onSelect }: HistoryListProps) {
  const { history, clearHistory } = useLookupStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Riwayat Lookup
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {history.map((h) => (
            <button
              key={h.timestamp}
              onClick={() => onSelect(h.result)}
              className="rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary/50 hover:text-primary"
            >
              {h.query}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
