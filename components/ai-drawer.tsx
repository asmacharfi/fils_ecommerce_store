"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";

import Button from "@/components/ui/button";
import AIProductCard from "@/components/ai-product-card";
import { useAIContext } from "@/components/ai-context";
import { Product } from "@/types";

type AssistantReply =
  | { type: "message"; content: string }
  | { type: "products"; content?: string; products: Product[] };

type ChatMessage = {
  role: "user" | "assistant";
  text?: string;
  products?: Product[];
};

const suggestionChips = [
  "Show me cheap products",
  "Similar to this product",
  "Best in this category",
];

const AIDrawer = () => {
  const { pageContext } = useAIContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "I can help you discover products, compare options, and add items to cart quickly.",
    },
  ]);

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.text)
        .map((message) => ({
          role: message.role,
          content: message.text as string,
        })),
    [messages]
  );

  const sendMessage = async (rawValue: string) => {
    const value = rawValue.trim();
    if (!value || loading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: value }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: value,
          context: pageContext,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as AssistantReply;

      if (data.type === "products") {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: data.content || "Here are the best matches I found.",
            products: data.products,
          },
        ]);
        return;
      }

      setMessages((current) => [...current, { role: "assistant", text: data.content }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not process that request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-black text-white shadow-xl transition hover:opacity-90"
        aria-label="Open shopping assistant"
      >
        <MessageCircle className="mx-auto h-6 w-6" />
      </button>

      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Shopping Assistant</h2>
                <button onClick={() => setOpen(false)} aria-label="Close assistant">
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{pageContext}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestionChips.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-full border px-3 py-1 text-xs transition hover:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="space-y-2">
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      message.role === "assistant" ? "text-gray-500" : "text-gray-700"
                    }`}
                  >
                    {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    <span>{message.role === "assistant" ? "Assistant" : "You"}</span>
                  </div>
                  {message.text && <p className="rounded-lg bg-gray-100 p-3 text-sm">{message.text}</p>}
                  {message.products && message.products.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {message.products.map((product) => (
                        <AIProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={onSubmit} className="border-t p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask for product recommendations..."
                  className="h-10 flex-1 rounded-full border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <Button type="submit" disabled={loading} className="h-10 px-4">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
};

export default AIDrawer;
