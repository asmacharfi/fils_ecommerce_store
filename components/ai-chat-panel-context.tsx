"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { SimilarProductsRequestContext } from "@/lib/ai/request-context";

type OpenChatWithMessageOptions = {
  requestContext?: SimilarProductsRequestContext;
};

export type AIChatPanelContextValue = {
  isOpen: boolean;
  pendingMessage: string | null;
  pendingRequestContext: SimilarProductsRequestContext | null;
  openChat: () => void;
  closeChat: () => void;
  openChatWithMessage: (text: string, options?: OpenChatWithMessageOptions) => void;
  clearPendingMessage: () => void;
};

/** Safe defaults if a consumer renders before the provider (e.g. Fast Refresh). */
const noopPanel: AIChatPanelContextValue = {
  isOpen: false,
  pendingMessage: null,
  pendingRequestContext: null,
  openChat: () => {},
  closeChat: () => {},
  openChatWithMessage: () => {},
  clearPendingMessage: () => {},
};

const AIChatPanelContext = createContext<AIChatPanelContextValue>(noopPanel);

export function AIChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingRequestContext, setPendingRequestContext] =
    useState<SimilarProductsRequestContext | null>(null);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => {
    setOpen(false);
    setPendingMessage(null);
    setPendingRequestContext(null);
  }, []);

  const clearPendingMessage = useCallback(() => {
    setPendingMessage(null);
    setPendingRequestContext(null);
  }, []);

  const openChatWithMessage = useCallback((text: string, options?: OpenChatWithMessageOptions) => {
    setPendingMessage(text.trim());
    setPendingRequestContext(options?.requestContext ?? null);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      pendingMessage,
      pendingRequestContext,
      openChat,
      closeChat,
      openChatWithMessage,
      clearPendingMessage,
    }),
    [
      isOpen,
      pendingMessage,
      pendingRequestContext,
      openChat,
      closeChat,
      openChatWithMessage,
      clearPendingMessage,
    ]
  );

  return <AIChatPanelContext.Provider value={value}>{children}</AIChatPanelContext.Provider>;
}

export function useAIChatPanel() {
  return useContext(AIChatPanelContext);
}
