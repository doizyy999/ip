"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryItem, IPLookupResult } from "@/types/ip";

interface LookupState {
  history: HistoryItem[];
  addHistory: (query: string, result: IPLookupResult) => void;
  clearHistory: () => void;
}

export const useLookupStore = create<LookupState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (query, result) =>
        set((state) => ({
          history: [
            { query, result, timestamp: Date.now() },
            ...state.history.filter((h) => h.query !== query)
          ].slice(0, 20)
        })),
      clearHistory: () => set({ history: [] })
    }),
    { name: "ipintel-history" }
  )
);
