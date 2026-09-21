"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { riskColor } from "@/lib/utils";

export function CopyField({ label, value }: { label: string; value?: string | number | null }) {
  const [copied, setCopied] = useState(false);
  if (value === undefined || value === null || value === "") return null;
  const text = String(value);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="truncate font-mono text-xs text-zinc-200">{text}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied");
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 text-zinc-500 hover:text-cyber-cyan"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ProfileCard({
  title,
  risk,
  fields,
  links,
}: {
  title: string;
  risk?: number;
  fields: { label: string; value?: string | number | null }[];
  links?: { label: string; url: string }[];
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-zinc-100">{title}</CardTitle>
        {risk !== undefined && (
          <Badge variant={risk >= 70 ? "red" : risk >= 40 ? "amber" : "green"}>
            Risk <span className={riskColor(risk)}>{risk}/100</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map((f) => (
          <CopyField key={f.label} label={f.label} value={f.value} />
        ))}
        {links?.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyber-cyan hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> {l.label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
