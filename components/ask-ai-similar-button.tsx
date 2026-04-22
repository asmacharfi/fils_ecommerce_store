"use client";

import { Sparkles } from "lucide-react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";

interface AskAISimilarButtonProps {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
}

/**
 * Product-page CTA (same idea as the reference repo’s AskAISimilarButton):
 * opens the shopping assistant with a prefilled “similar products” prompt.
 */
export function AskAISimilarButton({
  productId,
  productName,
  categoryId,
  categoryName,
}: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useAIChatPanel();

  return (
    <button
      type="button"
      onClick={() =>
        openChatWithMessage(`Show me products similar to "${productName}"`, {
          requestContext: {
            kind: "similar-products",
            productId,
            productName,
            categoryId,
            categoryName,
          },
        })
      }
      className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-700 hover:shadow-xl dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800"
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      Ask AI for similar products
    </button>
  );
}
