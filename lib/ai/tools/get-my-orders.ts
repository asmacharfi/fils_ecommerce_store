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
  items: { name: string; quantity: number; unitPrice: number; imageUrl?: string | null }[];
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
        return { found: false, message: "API boutique indisponible.", orders: [] };
      }
      if (!token) {
        return {
          found: false,
          message: "Le client doit se connecter pour voir ses commandes.",
          orders: [],
        };
      }

      try {
        const res = await fetch(`${root}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          return { found: false, message: "Session expirée. Reconnectez-vous.", orders: [] };
        }
        if (!res.ok) {
          return { found: false, message: "Impossible de charger les commandes pour le moment.", orders: [] };
        }
        const data = (await res.json()) as MyOrderRow[];
        if (!Array.isArray(data) || data.length === 0) {
          return { found: false, message: "Aucune commande pour ce compte sur cette boutique.", orders: [] };
        }
        return {
          found: true,
          message: `${data.length} commande(s) trouvée(s). Résumez statuts et montants clairement.`,
          orders: data,
        };
      } catch {
        return { found: false, message: "Erreur réseau lors du chargement des commandes.", orders: [] };
      }
    },
  });
}
