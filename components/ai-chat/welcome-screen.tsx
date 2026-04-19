"use client";

import { Package, Search, Sparkles } from "lucide-react";

type SendPayload = { text: string };

interface WelcomeScreenProps {
  onSuggestionClick: (message: SendPayload) => void;
}

const productSuggestions = [
  "Show me cheap products",
  "Similar to this product",
  "Best in this category",
];

/**
 * Guest storefront welcome (reference layout without signed-in order prompts).
 */
export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
        <Sparkles className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        How can I help you today?
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        I can help you find products by style, category, or price. Guest mode only — order lookup is not
        available here.
      </p>

      <div className="mt-6 w-full max-w-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Search className="h-3 w-3" />
          Find products
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {productSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-amber-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-amber-600 dark:hover:bg-zinc-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          For orders or account help, use checkout and your store&apos;s support flow — this assistant only
          searches the public catalog.
        </span>
      </div>
    </div>
  );
}
