"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";

export type AIChatPanelContextValue = {
  isOpen: boolean;
  pendingMessage: string | null;
  pendingViewerProduct: ChatViewerProduct | null;
  openChat: () => void;
  closeChat: () => void;
  openChatWithMessage: (text: string, viewer?: ChatViewerProduct) => void;
  clearPendingMessage: () => void;
};

/** Safe defaults if a consumer renders before the provider (e.g. Fast Refresh). */
const noopPanel: AIChatPanelContextValue = {
  isOpen: false,
  pendingMessage: null,
  pendingViewerProduct: null,
  openChat: () => {},
  closeChat: () => {},
  openChatWithMessage: () => {},
  clearPendingMessage: () => {},
};

const AIChatPanelContext = createContext<AIChatPanelContextValue>(noopPanel);

export function AIChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingViewerProduct, setPendingViewerProduct] = useState<ChatViewerProduct | null>(null);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => {
    setOpen(false);
    setPendingMessage(null);
    setPendingViewerProduct(null);
  }, []);

  const clearPendingMessage = useCallback(() => {
    setPendingMessage(null);
    setPendingViewerProduct(null);
  }, []);

  const openChatWithMessage = useCallback((text: string, viewer?: ChatViewerProduct) => {
    setPendingViewerProduct(viewer ?? null);
    setPendingMessage(text.trim());
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      pendingMessage,
      pendingViewerProduct,
      openChat,
      closeChat,
      openChatWithMessage,
      clearPendingMessage,
    }),
    [
      isOpen,
      pendingMessage,
      pendingViewerProduct,
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
