"use client";

import { CheckCircle2, Loader2, Search } from "lucide-react";

import AIProductCard from "@/components/ai-product-card";
import type { SearchProductsOutput } from "@/lib/ai/tools/search-products";

/**
 * Runtime shape for the shopping assistant's search tool in the UI stream.
 * (Default `UIMessage` tool generics do not include our tool name.)
 */
type CatalogToolName =
  | "tool-searchProducts"
  | "tool-findSimilarProducts"
  | "tool-getPersonalizedRecommendations";

export type SearchProductsToolUIPart = {
  type: CatalogToolName; // includes personalized picks (same card UI as search)
  toolCallId: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error"
    | "approval-requested"
    | "approval-responded"
    | "output-denied";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

interface ToolCallUIProps {
  toolPart: SearchProductsToolUIPart;
}

export function ToolCallUI({ toolPart }: ToolCallUIProps) {
  const displayName =
    toolPart.type === "tool-findSimilarProducts"
      ? "Similar products"
      : toolPart.type === "tool-getPersonalizedRecommendations"
        ? "Personalized picks"
        : "Catalog search";
  const isComplete =
    toolPart.state === "output-available" || toolPart.state === "output-error";

  const input =
    toolPart.state === "input-available" ||
    toolPart.state === "output-available" ||
    toolPart.state === "output-error"
      ? (toolPart.input as { query?: string; maxPrice?: number; minPrice?: number } | undefined)
      : undefined;

  const searchQuery = input?.query ? String(input.query) : undefined;
  const maxPrice =
    typeof input?.maxPrice === "number" && Number.isFinite(input.maxPrice) ? input.maxPrice : undefined;
  const minPrice =
    typeof input?.minPrice === "number" && Number.isFinite(input.minPrice) ? input.minPrice : undefined;

  const productResult =
    toolPart.state === "output-available" ? (toolPart.output as SearchProductsOutput | undefined) : undefined;

  const hasProducts =
    toolPart.state === "output-available" &&
    productResult?.found &&
    productResult.products &&
    productResult.products.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
            isComplete
              ? toolPart.state === "output-error"
                ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
          }`}
        >
          {toolPart.state === "output-error" ? (
            <span className="text-xs text-red-700 dark:text-red-300">
              {toolPart.errorText || "Search failed"}
            </span>
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-600 dark:text-amber-400" />
          )}
          {toolPart.state !== "output-error" && (
            <div className="flex flex-col">
              <span
                className={`font-medium ${
                  isComplete
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {isComplete ? `${displayName} done` : `${displayName}…`}
              </span>
              {(() => {
                const bits: string[] = [];
                if (searchQuery) bits.push(`Query: "${searchQuery}"`);
                if (minPrice != null) bits.push(`Min $${minPrice}`);
                if (maxPrice != null) bits.push(`Max $${maxPrice}`);
                if (!bits.length) return null;
                return (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{bits.join(" · ")}</span>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {hasProducts && productResult?.products && (
        <div className="ml-11 mt-2">
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            {productResult.products.length === 1
              ? "1 product found"
              : `${productResult.products.length} products found`}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {productResult.products.map((product) => (
              <AIProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
