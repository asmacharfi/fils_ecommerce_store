"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";

import { MessageBubble } from "@/components/ai-chat/message-bubble";
import { ToolCallUI, type SearchProductsToolUIPart } from "@/components/ai-chat/tool-call-ui";
import { WelcomeScreen } from "@/components/ai-chat/welcome-screen";
import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import { useAIContext } from "@/components/ai-context";
import Button from "@/components/ui/button";
import { formatAiChatError, isOpenAIQuotaOrBillingError } from "@/lib/ai/format-chat-error";

function getTextFromParts(message: UIMessage): string {
  const parts = message.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

function AssistantErrorPanel({
  error,
  onDismiss,
  onStop,
}: {
  error: Error;
  onDismiss: () => void;
  onStop: () => void;
}) {
  const quota = isOpenAIQuotaOrBillingError(error);

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-semibold">Assistant could not complete that request</p>
      <p className="mt-1 text-xs leading-relaxed opacity-90">{formatAiChatError(error)}</p>

      {quota && (
        <div className="mt-3 rounded-lg border border-amber-300/80 bg-white/70 px-3 py-2 text-left text-xs text-zinc-800 dark:border-amber-800 dark:bg-zinc-900/60 dark:text-zinc-200">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Fix it (OpenAI)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>
              Open{" "}
              <a
                className="font-medium text-amber-800 underline hover:text-amber-900 dark:text-amber-300"
                href="https://platform.openai.com/account/billing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Billing
              </a>{" "}
              and add a payment method or buy credits.
            </li>
            <li>
              Confirm an API key at{" "}
              <a
                className="font-medium text-amber-800 underline hover:text-amber-900 dark:text-amber-300"
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                API keys
              </a>
              .
            </li>
            <li>
              Set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">OPENAI_API_KEY</code> in{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env</code> (see{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.example</code>).
            </li>
            <li>Restart <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run dev</code>.</li>
          </ol>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="text-xs font-medium underline" onClick={onDismiss}>
          Dismiss
        </button>
        <button type="button" className="text-xs font-medium underline" onClick={() => void onStop()}>
          Stop request
        </button>
      </div>
    </div>
  );
}

const AIDrawer = () => {
  const { pageContext, viewerProduct } = useAIContext();
  const { isOpen, closeChat, pendingMessage, pendingViewerProduct, clearPendingMessage } =
    useAIChatPanel();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages, trigger, messageId, body }) => ({
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            pageContext,
            viewerProduct: pendingViewerProduct ?? viewerProduct,
          },
        }),
      }),
    [pageContext, pendingViewerProduct, viewerProduct]
  );

  const { messages, sendMessage, status, error, stop, clearError } = useChat({
    transport,
    messages: [],
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!isOpen || !pendingMessage || busy) {
      return;
    }
    let cancelled = false;
    void (async () => {
      await sendMessage({ text: pendingMessage });
      if (!cancelled) clearPendingMessage();
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, pendingMessage, busy, sendMessage, clearPendingMessage]);

  const sendFromText = async (raw: string) => {
    const value = raw.trim();
    if (!value || busy) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendFromText(input);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-40 bg-black/50 sm:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-drawer-title"
        className="fixed z-50 box-border overflow-hidden border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full sm:left-auto sm:right-0 sm:top-0 sm:h-screen sm:w-[448px] sm:border-l"
      >
        <div className="relative h-full w-full">
          <header className="absolute left-0 right-0 top-0 z-10 h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={closeChat}
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-md text-center leading-10 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Close assistant"
            >
              <X className="inline-block h-4 w-4 align-middle" />
            </button>
            <div
              id="ai-drawer-title"
              className="truncate pl-6 pr-16 text-base font-semibold leading-[4rem] text-zinc-900 dark:text-zinc-100"
            >
              <Sparkles className="mr-2 inline-block h-5 w-5 align-middle text-amber-500" />
              Shopping Assistant
            </div>
          </header>

          <div className="absolute bottom-[88px] left-0 right-0 top-16 overflow-y-auto overscroll-contain px-4 py-4">
            {error && (
              <AssistantErrorPanel
                error={error}
                onDismiss={() => clearError()}
                onStop={() => stop()}
              />
            )}

            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={(msg) => void sendFromText(msg.text)} />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  if (message.role === "user") {
                    const content = getTextFromParts(message);
                    if (!content.trim()) return null;
                    return (
                      <div key={message.id} className="space-y-3">
                        <MessageBubble role="user" content={content} />
                      </div>
                    );
                  }

                  const parts = message.parts;
                  const hasRenderablePart = Array.isArray(parts)
                    ? parts.some((part) => {
                        if (isTextUIPart(part) && part.text.trim()) return true;
                        if (isToolUIPart(part) && part.type === "tool-searchProducts") return true;
                        return false;
                      })
                    : false;

                  if (!hasRenderablePart) return null;

                  return (
                    <div key={message.id} className="space-y-3">
                      {(parts ?? []).map((part, idx) => {
                        if (isToolUIPart(part) && part.type === "tool-searchProducts") {
                          return (
                            <ToolCallUI
                              key={`${message.id}-${part.toolCallId ?? idx}`}
                              toolPart={part as SearchProductsToolUIPart}
                            />
                          );
                        }
                        if (isTextUIPart(part) && part.text.trim()) {
                          return (
                            <MessageBubble
                              key={`${message.id}-text-${idx}`}
                              role="assistant"
                              content={part.text}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  );
                })}

                {busy && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
            <form onSubmit={onSubmit} className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our products..."
                disabled={busy}
                className="box-border h-10 w-full rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-12 text-sm text-zinc-900 shadow-sm outline-none ring-offset-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-offset-zinc-950"
              />
              <Button
                type="submit"
                disabled={!input.trim() || busy}
                className="absolute right-0 top-0 h-10 w-10 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 p-0 text-center leading-10 text-white shadow-md shadow-amber-200/50 hover:from-amber-600 hover:to-orange-600 dark:shadow-amber-900/30"
                aria-label="Send message"
              >
                {busy ? (
                  <Loader2 className="inline-block h-4 w-4 animate-spin align-middle" />
                ) : (
                  <Send className="inline-block h-4 w-4 align-middle" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AIDrawer;
