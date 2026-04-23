"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Container from "@/components/ui/container";
import { getBrowserStoreApiRoot } from "@/lib/public-store-api";

type OrderRow = {
  id: string;
  createdAt: string;
  statusLabel: string;
  isPaid: boolean;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function statusBadgeClass(label: string) {
  if (label === "awaiting_payment") return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
  if (label === "shipped") return "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100";
  if (label === "delivered") return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100";
  return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";
}

export default function AccountOrdersPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    const run = async () => {
      const root = getBrowserStoreApiRoot();
      const token = await getToken();
      if (!root || !token) {
        setLoadError("Store API or session is not available.");
        setOrders([]);
        return;
      }
      try {
        const res = await axios.get(`${root}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          setOrders(Array.isArray(res.data) ? res.data : []);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load your orders.");
          setOrders([]);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <Container>
        <div className="flex min-h-[40vh] items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </Container>
    );
  }

  if (!isSignedIn) {
    return (
      <Container>
        <div className="mx-auto max-w-lg py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Sign in required</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create an account or sign in to see your orders and delivery status.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Sign in
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My orders</h1>
          <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
            Continue shopping
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Track payment, preparation, shipping, and delivery for this store.
        </p>

        {orders === null && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        )}

        {loadError && (
          <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {loadError}
          </p>
        )}

        {orders && orders.length === 0 && !loadError && (
          <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No orders yet.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="mt-8 space-y-6">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-500">Order {o.id}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                        o.statusLabel
                      )}`}
                    >
                      {o.statusLabel.replace(/_/g, " ")}
                    </span>
                    <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatMoney(o.total)}
                    </p>
                  </div>
                </div>

                {o.trackingNumber ? (
                  <p className="mt-4 text-sm font-medium text-violet-700 dark:text-violet-300">
                    Tracking: {o.trackingNumber}
                  </p>
                ) : null}

                <ul className="mt-4 space-y-1 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-4 text-zinc-700 dark:text-zinc-300">
                      <span>
                        {it.name} ×{it.quantity}
                      </span>
                      <span className="shrink-0 text-zinc-500">{formatMoney(it.unitPrice * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
