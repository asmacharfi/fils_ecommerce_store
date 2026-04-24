"use client";

import { CheckCircle2, Package, Truck } from "lucide-react";

import { StackedProductImages } from "@/components/account/stacked-product-images";

export type AccountOrderRow = {
  id: string;
  createdAt: string;
  statusLabel: string;
  isPaid: boolean;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  total: number;
  items: { name: string; quantity: number; unitPrice: number; imageUrl?: string | null }[];
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD" }).format(n);
}

function formatStatusFr(label: string): string {
  const map: Record<string, string> = {
    awaiting_payment: "En attente de paiement",
    processing: "Préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
  };
  return map[label] ?? label.replace(/_/g, " ");
}

function statusBadgeClass(label: string) {
  if (label === "awaiting_payment") return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
  if (label === "shipped") return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100";
  if (label === "delivered") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";
}

function StatusIcon({ label }: { label: string }) {
  if (label === "shipped") return <Truck className="h-3.5 w-3.5" aria-hidden />;
  if (label === "delivered") return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />;
  return <Package className="h-3.5 w-3.5" aria-hidden />;
}

/** Short display id (reference uses order numbers; we use compact UUID). */
function formatOrderRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function OrderAccountCard({ order }: { order: AccountOrderRow }) {
  const stackUrls = order.items.map((it) => it.imageUrl).filter((u): u is string => Boolean(u));
  const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);
  const previewNames = order.items
    .flatMap((it) => Array.from({ length: it.quantity }, () => it.name))
    .slice(0, 2);
  const extra = itemCount > previewNames.length;

  return (
    <li className="list-none">
      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6">
          <StackedProductImages
            urls={stackUrls}
            alt={`Articles commande ${formatOrderRef(order.id)}`}
            className="mx-auto sm:mx-0"
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Commande #{formatOrderRef(order.id)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                  order.statusLabel
                )}`}
              >
                <StatusIcon label={order.statusLabel} />
                {formatStatusFr(order.statusLabel)}
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {itemCount} article{itemCount > 1 ? "s" : ""}
                </p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatMoney(order.total)}</p>
              </div>
            </div>

            {order.trackingNumber ? (
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                Suivi : {order.trackingNumber}
              </p>
            ) : null}

            <p className="border-t border-zinc-100 pt-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              {previewNames.join(", ")}
              {extra ? "…" : ""}
            </p>

            <ul className="space-y-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4 text-zinc-700 dark:text-zinc-300">
                  <span className="min-w-0">
                    {it.name} ×{it.quantity}
                  </span>
                  <span className="shrink-0 text-zinc-500">{formatMoney(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </li>
  );
}
