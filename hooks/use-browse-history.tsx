"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BrowseHit = {
  productId: string;
  categoryId: string;
  at: number;
};

const MAX = 40;

interface BrowseHistoryStore {
  hits: BrowseHit[];
  recordView: (productId: string, categoryId: string) => void;
  clear: () => void;
}

export const useBrowseHistory = create(
  persist<BrowseHistoryStore>(
    (set, get) => ({
      hits: [],
      recordView: (productId, categoryId) => {
        if (!productId || !categoryId) return;
        const next: BrowseHit = { productId, categoryId, at: Date.now() };
        const rest = get().hits.filter((h) => h.productId !== productId);
        set({ hits: [next, ...rest].slice(0, MAX) });
      },
      clear: () => set({ hits: [] }),
    }),
    {
      name: "store-browse-history-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function browseHistorySummary(hits: BrowseHit[]): string {
  if (!hits.length) return "";
  const lines = hits.slice(0, 8).map((h) => `- productId ${h.productId} (category ${h.categoryId})`);
  return `Recently viewed (most recent first):\n${lines.join("\n")}`;
}
