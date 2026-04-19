"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type CartQuantityControlsProps = {
  quantity: number;
  maxStock: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
};

const stepBtn =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800";

export function CartQuantityControls({
  quantity,
  maxStock,
  onIncrement,
  onDecrement,
  className,
}: CartQuantityControlsProps) {
  const atMax = quantity >= maxStock;
  const atMin = quantity <= 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0 rounded-md border border-zinc-300 bg-white shadow-sm transition-opacity duration-200 dark:border-zinc-600 dark:bg-zinc-900",
        className
      )}
    >
      <button
        type="button"
        className={cn(stepBtn, "rounded-l-md border-r border-zinc-200 dark:border-zinc-700")}
        onClick={onDecrement}
        disabled={atMin}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2.5rem] select-none px-2 text-center text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
        {quantity}
      </span>
      <button
        type="button"
        className={cn(stepBtn, "rounded-r-md border-l border-zinc-200 dark:border-zinc-700")}
        onClick={onIncrement}
        disabled={atMax || maxStock <= 0}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
