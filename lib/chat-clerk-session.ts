"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

/** Populated by `ChatSessionTokenBridge` so `DefaultChatTransport` can attach Authorization without breaking hook rules. */
export const chatRequestGetTokenRef: { current: () => Promise<string | null> } = {
  current: async () => null,
};

/** Mount only when Clerk is enabled (parent renders inside `ClerkProvider`). */
export function ChatSessionTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    chatRequestGetTokenRef.current = getToken;
    return () => {
      chatRequestGetTokenRef.current = async () => null;
    };
  }, [getToken]);

  return null;
}
