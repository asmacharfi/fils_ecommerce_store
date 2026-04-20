"use client";

import axios from "axios";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";

const Summary = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);

  useEffect(() => {
    if (searchParams.get("canceled")) {
      toast.error("Something went wrong.");
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

    toast.success("Payment completed.");
    removeAll();
    router.refresh();

    const base = process.env.NEXT_PUBLIC_API_URL;
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
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      toast.error("Store API is not configured.");
      return;
    }

    const payload = {
      items: items.map((line) =>
        line.variantId
          ? { variantId: line.variantId, quantity: line.quantity }
          : { productId: line.product.id, quantity: line.quantity }
      ),
    };

    try {
      await axios.post(`${base}/products/validate-stock`, payload);
    } catch {
      toast.error("Some items are no longer available in the requested quantity.");
      return;
    }

    try {
      const response = await axios.post(`${base}/checkout`, payload);
      window.location.href = response.data.url;
    } catch {
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">Order total</div>
          <Currency value={totalPrice} />
        </div>
      </div>

      <Button onClick={onCheckout} disabled={items.length === 0} className="mt-6 w-full">
        Checkout
      </Button>
    </div>
  );
};

export default Summary;
