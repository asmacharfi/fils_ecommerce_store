import { tool } from "ai";
import { z } from "zod";

import { getStoreApiRoot } from "@/lib/get-store-api-root";

export type MyOrderRow = {
  id: string;
  createdAt: string;
  statusLabel: string;
  isPaid: boolean;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  total: number;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    productId: string;
    imageUrl?: string | null;
  }[];
};

export type GetMyOrdersOutput = {
  found: boolean;
  message: string;
  orders: MyOrderRow[];
};

export function createGetMyOrdersTool(getToken: () => Promise<string | null>) {
  return tool({
    description:
      "Fetch the signed-in customer's orders for this store: status (payment + shipping), totals, line items, tracking when available. Only call when the shopper is authenticated.",
    inputSchema: z.object({}),
    execute: async (): Promise<GetMyOrdersOutput> => {
      const root = getStoreApiRoot();
      const token = await getToken();
      if (!root) {
        return { found: false, message: "Store API is unavailable.", orders: [] };
      }
      if (!token) {
        return {
          found: false,
          message: "The customer must sign in to view orders.",
          orders: [],
        };
      }

      try {
        const res = await fetch(`${root}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          return { found: false, message: "Session expired. Please sign in again.", orders: [] };
        }
        if (!res.ok) {
          return { found: false, message: "Could not load orders right now.", orders: [] };
        }
        const data = (await res.json()) as MyOrderRow[];
        if (!Array.isArray(data) || data.length === 0) {
          return { found: false, message: "No orders for this account in this store.", orders: [] };
        }
        return {
          found: true,
          message: `${data.length} order(s) found. Summarize status and totals clearly; the UI shows images and links.`,
          orders: data,
        };
      } catch {
        return { found: false, message: "Network error while loading orders.", orders: [] };
      }
    },
  });
}
