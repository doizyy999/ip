import { detectType, type SearchType } from "./utils";

export interface ModuleResult {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export interface SearchResult {
  id: string;
  query: string;
  type: SearchType;
  modules: Record<string, ModuleResult>;
  createdAt: string;
}

export function modulesFor(type: SearchType): string[] {
  switch (type) {
    case "username":
      return ["username", "social", "public-records"];
    case "email":
      return ["email", "public-records"];
    case "phone":
      return ["phone"];
    case "domain":
      return ["domain", "public-records"];
  }
}

const TOTAL_TIMEOUT = 30_000;

export async function runOrchestration(
  baseUrl: string,
  query: string,
  onProgress?: (module: string) => void
): Promise<SearchResult> {
  const type = detectType(query);
  const mods = modulesFor(type);

  const tasks = mods.map(async (m): Promise<[string, ModuleResult]> => {
    const started = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TOTAL_TIMEOUT);
    try {
      onProgress?.(m);
      const res = await fetch(`${baseUrl}/api/${m}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: ctrl.signal,
      });
      const json = await res.json();
      return [
        m,
        {
          success: json.success ?? false,
          data: json.data,
          error: json.error,
          durationMs: Date.now() - started,
        },
      ];
    } catch (e) {
      return [
        m,
        {
          success: false,
          error: e instanceof Error ? e.message : "Module failed",
          durationMs: Date.now() - started,
        },
      ];
    } finally {
      clearTimeout(timer);
    }
  });

  const settled = await Promise.allSettled(tasks);
  const modules: Record<string, ModuleResult> = {};
  for (const s of settled) {
    if (s.status === "fulfilled") modules[s.value[0]] = s.value[1];
  }

  return {
    id: crypto.randomUUID(),
    query,
    type,
    modules,
    createdAt: new Date().toISOString(),
  };
}
