"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { GraphData } from "@/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const GROUP_COLORS: Record<string, string> = {
  target: "#06b6d4",
  account: "#8b5cf6",
  org: "#ec4899",
  location: "#10b981",
  domain: "#f59e0b",
};

interface FGNode { id: string; label: string; group: string; x?: number; y?: number }
interface FGLink { source: string | FGNode; target: string | FGNode; label?: string }

export function RelationshipGraph({ data }: { data: GraphData }) {
  const [selected, setSelected] = useState<FGNode | null>(null);
  const graph = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })) as FGNode[],
      links: data.links.map((l) => ({ ...l })) as FGLink[],
    }),
    [data]
  );

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <ForceGraph2D
        graphData={graph}
        width={800}
        height={500}
        nodeCanvasObject={(node, ctx, scale) => {
          const n = node as FGNode;
          const size = n.group === "target" ? 8 : 5;
          ctx.beginPath();
          ctx.arc(n.x ?? 0, n.y ?? 0, size, 0, 2 * Math.PI);
          ctx.fillStyle = GROUP_COLORS[n.group] ?? "#71717a";
          ctx.fill();
          const fontSize = 12 / scale;
          ctx.font = `${fontSize}px JetBrains Mono, monospace`;
          ctx.fillStyle = "#e4e4e7";
          ctx.fillText(n.label, (n.x ?? 0) + size + 2, (n.y ?? 0) + fontSize / 2);
        }}
        linkColor={() => "#3f3f46"}
        onNodeClick={(n) => setSelected(n as FGNode)}
        cooldownTicks={100}
      />
      {selected && (
        <div className="absolute right-3 top-3 rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-xs">
          <p className="font-mono text-cyber-cyan">{selected.label}</p>
          <p className="text-zinc-500">group: {selected.group}</p>
          <p className="text-zinc-500">id: {selected.id}</p>
        </div>
      )}
    </div>
  );
}
