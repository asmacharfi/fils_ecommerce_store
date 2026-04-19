"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AIChatPanelContextValue = {
  isOpen: boolean;
  pendingMessage: string | null;
  openChat: () => void;
  closeChat: () => void;
  openChatWithMessage: (text: string) => void;
  clearPendingMessage: () => void;
};

/** Safe defaults if a consumer renders before the provider (e.g. Fast Refresh). */
const noopPanel: AIChatPanelContextValue = {
  isOpen: false,
  pendingMessage: null,
  openChat: () => {},
  closeChat: () => {},
  openChatWithMessage: () => {},
  clearPendingMessage: () => {},
};

const AIChatPanelContext = createContext<AIChatPanelContextValue>(noopPanel);

export function AIChatPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => {
    setOpen(false);
    setPendingMessage(null);
  }, []);

  const clearPendingMessage = useCallback(() => setPendingMessage(null), []);

  const openChatWithMessage = useCallback((text: string) => {
    setPendingMessage(text.trim());
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      pendingMessage,
      openChat,
      closeChat,
      openChatWithMessage,
      clearPendingMessage,
    }),
    [isOpen, pendingMessage, openChat, closeChat, openChatWithMessage, clearPendingMessage]
  );

  return <AIChatPanelContext.Provider value={value}>{children}</AIChatPanelContext.Provider>;
}

export function useAIChatPanel() {
  return useContext(AIChatPanelContext);
}
