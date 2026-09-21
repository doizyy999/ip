import * as React from "react";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  default: "border-zinc-700 bg-zinc-800 text-zinc-300",
  cyan: "border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan",
  purple: "border-cyber-purple/50 bg-cyber-purple/10 text-cyber-purple",
  pink: "border-cyber-pink/50 bg-cyber-pink/10 text-cyber-pink",
  green: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  red: "border-red-500/50 bg-red-500/10 text-red-400",
  amber: "border-amber-500/50 bg-amber-500/10 text-amber-400",
};

export function Badge({
  className,
  variant = "default",
  ...p
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...p}
    />
  );
}
