"use client";

import { CheckCircle2, ExternalLink, Loader2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { GetMyOrdersOutput } from "@/lib/ai/tools/get-my-orders";
import { formatOrderStatusEn, orderStatusBadgeClass } from "@/lib/order-status-display";

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

function formatOrderRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function OrdersToolUI({ toolPart }: { toolPart: GetMyOrdersToolUIPart }) {
  const isComplete =
    toolPart.state === "output-available" || toolPart.state === "output-error";

  const result =
    toolPart.state === "output-available" ? (toolPart.output as GetMyOrdersOutput | undefined) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <Package className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
            isComplete
              ? toolPart.state === "output-error"
                ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
              : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
          }`}
        >
          {toolPart.state === "output-error" ? (
            <span className="text-xs text-red-700 dark:text-red-300">
              {toolPart.errorText || "Could not load orders"}
            </span>
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600 dark:text-violet-400" />
          )}
          {toolPart.state !== "output-error" && (
            <span className="font-medium text-violet-800 dark:text-violet-200">
              {isComplete ? "Your orders" : "Loading your orders…"}
            </span>
          )}
        </div>
      </div>

      {result?.found && result.orders.length > 0 && (
        <div className="ml-0 space-y-3 sm:ml-11">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 underline-offset-2 hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
          >
            Open full order history
            <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>

          {result.orders.map((o) => (
            <div
              key={o.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/80 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950/80"
            >
              <div className="flex flex-col gap-3 border-b border-zinc-100 px-3 py-3 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between sm:px-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Order #{formatOrderRef(o.id)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(o.createdAt).toLocaleString("en-US")} · {formatMoney(o.total)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${orderStatusBadgeClass(
                    o.statusLabel
                  )}`}
                >
                  {formatOrderStatusEn(o.statusLabel)}
                </span>
              </div>

              {o.trackingNumber ? (
                <p className="border-b border-zinc-100 px-3 py-2 text-xs font-medium text-violet-700 dark:border-zinc-800 dark:text-violet-300 sm:px-4">
                  Tracking: {o.trackingNumber}
                </p>
              ) : null}

              <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4">
                {o.items.map((it, i) => {
                  const href = it.productId ? `/product/${it.productId}` : undefined;
                  const inner = (
                    <div className="flex w-[140px] shrink-0 flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-900">
                      <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {it.imageUrl ? (
                          <Image
                            src={it.imageUrl}
                            alt=""
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                            No img
                          </div>
                        )}
                      </div>
                      <p className="line-clamp-2 text-[11px] font-medium leading-tight text-zinc-800 dark:text-zinc-200">
                        {it.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">×{it.quantity}</p>
                    </div>
                  );
                  return href ? (
                    <Link key={`${o.id}-${i}`} href={href} className="transition-opacity hover:opacity-90">
                      {inner}
                    </Link>
                  ) : (
                    <div key={`${o.id}-${i}`}>{inner}</div>
                  );
                })}
              </div>

              <div className="border-t border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-4">
                <Link
                  href="/account/orders"
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline dark:text-amber-400"
                >
                  View line totals in My orders →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
