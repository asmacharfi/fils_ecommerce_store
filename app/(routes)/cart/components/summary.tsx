"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { useShopperId } from "@/hooks/use-shopper-id";
import { CLERK_UI_ENABLED } from "@/lib/clerk-public";
import { getStoreApiRoot } from "@/lib/get-store-api-root";

function SummaryInner({
  userId,
  getToken,
}: {
  userId: string | null | undefined;
  getToken: () => Promise<string | null>;
}) {
  const shopperId = useShopperId();
  const searchParams = useSearchParams();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);

  useEffect(() => {
    if (searchParams.get("canceled")) {
      toast.error("Paiement annulé ou erreur.");
      return;
    }

    if (!searchParams.get("success")) return;

    const sessionId = searchParams.get("session_id");
    const dedupeKey = sessionId ? `checkout-return:${sessionId}` : "checkout-return:legacy";
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
      if (typeof window !== "undefined") sessionStorage.setItem(dedupeKey, "1");
    } catch {
      // sessionStorage unavailable
    }

    toast.success("Paiement confirmé.");
    removeAll();
    // Avoid router.refresh() here — it refetches the whole RSC tree and can remount Clerk before the session is ready, hiding Connexion / compte. Strip success params with a client navigation instead.
    const path = typeof window !== "undefined" ? window.location.pathname || "/cart" : "/cart";
    setTimeout(() => {
      if (searchParams.get("success")) router.replace(path);
    }, 0);

    const base = getStoreApiRoot();
    if (sessionId && base) {
      void axios.post(`${base}/checkout/confirm`, { sessionId }).catch(() => {
        /* Webhook may still mark paid; avoid noisy toast */
      });
    }
  }, [searchParams, removeAll, router]);

  const totalPrice = items.reduce((total, line) => {
    return total + Number(line.product.price) * line.quantity;
  }, 0);

  const onCheckout = async () => {
    const base = getStoreApiRoot();
    if (!base) {
      toast.error("L’API boutique n’est pas configurée.");
      return;
    }

    const lineItems = items.map((line) =>
      line.variantId
        ? { variantId: line.variantId, quantity: line.quantity }
        : { productId: line.product.id, quantity: line.quantity }
    );

    const payload = {
      items: lineItems,
      ...(shopperId ? { shopperId } : {}),
      ...(userId ? { clerkUserId: userId } : {}),
    };

    try {
      await axios.post(`${base}/products/validate-stock`, { items: lineItems });
    } catch {
      toast.error("Certains articles ne sont plus disponibles en cette quantité.");
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(`${base}/checkout`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      window.location.href = response.data.url;
    } catch {
      toast.error("Échec du paiement. Réessayez.");
    }
  };

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Récapitulatif</h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">Total</div>
          <Currency value={totalPrice} />
        </div>
      </div>

      <Button onClick={onCheckout} disabled={items.length === 0} className="mt-6 w-full">
        Payer
      </Button>
    </div>
  );
}

function SummaryWithClerk() {
  const { userId, getToken } = useAuth();
  return <SummaryInner userId={userId} getToken={getToken} />;
}

const Summary = () => {
  if (!CLERK_UI_ENABLED) {
    return <SummaryInner userId={null} getToken={async () => null} />;
  }
  return <SummaryWithClerk />;
};

export default Summary;
