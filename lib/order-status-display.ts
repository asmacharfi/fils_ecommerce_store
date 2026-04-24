/** English labels + badge styles for storefront order fulfillment (API `statusLabel`). */

export function formatOrderStatusEn(label: string): string {
  const map: Record<string, string> = {
    awaiting_payment: "Awaiting payment",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
  };
  return map[label] ?? label.replace(/_/g, " ");
}

export function orderStatusBadgeClass(label: string): string {
  if (label === "awaiting_payment") return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
  if (label === "shipped") return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100";
  if (label === "delivered") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";
}
