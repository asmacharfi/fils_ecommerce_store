"use client";

import { Sparkles } from "lucide-react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import type { Product } from "@/types";

interface AskAISimilarButtonProps {
  product: Product;
}

/**
 * Product-page CTA (same idea as the reference repo’s AskAISimilarButton):
 * opens the shopping assistant with a prefilled “similar products” prompt.
 */
export function AskAISimilarButton({ product }: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useAIChatPanel();

  const viewer: ChatViewerProduct = {
    id: product.id,
    name: product.name,
    categoryId: product.category.id,
  };

  return (
    <button
      type="button"
      onClick={() =>
        openChatWithMessage(`Show me products similar to "${product.name}"`, viewer)
      }
      className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-700 hover:shadow-xl dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800"
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      Ask AI for similar products
    </button>
  );
}
