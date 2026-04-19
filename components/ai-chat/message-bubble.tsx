"use client";

import { Bot, User } from "lucide-react";

import { stripMarkdownImages } from "@/lib/ai/strip-markdown-images";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const displayContent =
    role === "assistant" ? stripMarkdownImages(content).trim() : content;

  if (!displayContent.trim()) {
    return null;
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-zinc-900 dark:bg-zinc-100" : "bg-amber-100 dark:bg-amber-900/30"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white dark:text-zinc-900" />
        ) : (
          <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
      </div>
    </div>
  );
}
