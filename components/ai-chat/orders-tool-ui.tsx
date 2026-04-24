"use client";

import { CheckCircle2, Loader2, Package } from "lucide-react";

import type { GetMyOrdersOutput } from "@/lib/ai/tools/get-my-orders";

export type GetMyOrdersToolUIPart = {
  type: "tool-getMyOrders";
  toolCallId: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error"
    | "approval-requested"
    | "approval-responded"
    | "output-denied";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function OrdersToolUI({ toolPart }: { toolPart: GetMyOrdersToolUIPart }) {
  const isComplete =
    toolPart.state === "output-available" || toolPart.state === "output-error";

  const result =
    toolPart.state === "output-available" ? (toolPart.output as GetMyOrdersOutput | undefined) : undefined;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <Package className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
            isComplete
              ? toolPart.state === "output-error"
                ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
              : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
          }`}
        >
          {toolPart.state === "output-error" ? (
            <span className="text-xs text-red-700 dark:text-red-300">
              {toolPart.errorText || "Impossible de charger les commandes"}
            </span>
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600 dark:text-violet-400" />
          )}
          {toolPart.state !== "output-error" && (
            <span className="font-medium text-violet-800 dark:text-violet-200">
              {isComplete ? "Vos commandes" : "Chargement de vos commandes…"}
            </span>
          )}
        </div>
      </div>

      {result?.found && result.orders.length > 0 && (
        <div className="ml-11 space-y-3">
          {result.orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Commande <span className="font-mono text-xs">{o.id.slice(0, 8)}…</span>
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {o.statusLabel.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(o.createdAt).toLocaleString()} · {formatMoney(o.total)}
              </p>
              {o.trackingNumber ? (
                <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                  Suivi : {o.trackingNumber}
                </p>
              ) : null}
              <ul className="mt-2 space-y-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                {o.items.map((it, i) => (
                  <li key={`${o.id}-${i}`}>
                    {it.name} ×{it.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
