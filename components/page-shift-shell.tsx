"use client";

import type { ReactNode } from "react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import { cn } from "@/lib/utils";

type PageShiftShellProps = {
  children: ReactNode;
};

/**
 * Desktop: `margin-right: 448px` on this block (animated) so all in-flow content moves left.
 * Must not use `width: 100%` here — combined with horizontal margin it overflows the viewport
 * and the shift is not visible; `width: auto` lets the used width shrink by the margin.
 * Mobile: no horizontal margin (`sm:` only) so the fixed full-screen drawer does not reflow this shell.
 */
export function PageShiftShell({ children }: PageShiftShellProps) {
  const { isOpen } = useAIChatPanel();

  return (
    <div
      className={cn(
        "block box-border min-h-[100vh] w-auto max-w-none overflow-x-visible overflow-y-visible transition-[margin-right] duration-300 ease-out",
        isOpen && "sm:mr-[448px]"
      )}
    >
      {children}
    </div>
  );
}
