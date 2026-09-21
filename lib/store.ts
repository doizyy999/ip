// Client-side history store (localStorage)
export interface HistoryEntry {
  id: string;
  query: string;
  type: string;
  createdAt: string;
}

const KEY = "trace:history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const list = getHistory().filter((h) => h.id !== entry.id);
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function saveResult(id: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`trace:${id}`, JSON.stringify(data));
  } catch {
    // storage penuh — abaikan
  }
}

export function loadResult<T>(id: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`trace:${id}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
