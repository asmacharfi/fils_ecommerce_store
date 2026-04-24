"use client";

import { ClerkLoaded, ClerkLoading, SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import axios, { isAxiosError } from "axios";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { OrderAccountCard, type AccountOrderRow } from "@/components/account/order-account-card";
import Container from "@/components/ui/container";
import { CLERK_UI_ENABLED } from "@/lib/clerk-public";
import { getBrowserStoreApiRoot } from "@/lib/public-store-api";

const LINK_CLASS =
  "text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200";

function AccountOrdersSignedIn() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<AccountOrderRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const root = getBrowserStoreApiRoot();
      const token = await getToken({ skipCache: true });
      if (!root || !token) {
        setLoadError("Store API or session unavailable.");
        setOrders([]);
        return;
      }
      if (!/\/api\/[0-9a-f-]{36}\/?$/i.test(root)) {
        setLoadError(
          "NEXT_PUBLIC_API_URL must look like https://<admin>/api/<storeId> (store UUID, no trailing slash)."
        );
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
      } catch (e) {
        if (!cancelled) {
          if (isAxiosError(e) && e.response) {
            const st = e.response.status;
            const body = typeof e.response.data === "string" ? e.response.data : "";
            if (st === 401) {
              setLoadError(
                "Session rejected by the API (401). Ensure the admin deployment uses the same CLERK_SECRET_KEY as this store’s Clerk app."
              );
            } else if (st === 404) {
              setLoadError("Orders not found (404). Check NEXT_PUBLIC_API_URL (…/api/<storeId>).");
            } else {
              setLoadError(body || `Server error (${st}). Could not load your orders.`);
            }
          } else {
            setLoadError("Network error. Could not load your orders.");
          }
          setOrders([]);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <Container>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My orders</h1>
          <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
            Continue shopping
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Track payment, fulfillment, shipping, and delivery.
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
              <OrderAccountCard key={o.id} order={o} />
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}

function AccountOrdersClerk() {
  return (
    <>
      <ClerkLoading>
        <Container>
          <div className="flex min-h-[40vh] items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        </Container>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <Container>
            <div className="mx-auto max-w-lg py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-400" />
              <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Sign in required</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Create an account or sign in to see your orders and shipping status.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <SignInButton mode="modal" redirectUrl="/account/orders">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <Link href="/sign-up" className={LINK_CLASS}>
                  Create account
                </Link>
              </div>
            </div>
          </Container>
        </SignedOut>
        <SignedIn>
          <AccountOrdersSignedIn />
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}

export default function AccountOrdersPage() {
  if (!CLERK_UI_ENABLED) {
    return (
      <Container>
        <div className="mx-auto max-w-lg py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Account unavailable</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign-in is not configured on this deployment (missing Clerk keys). Add{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">CLERK_SECRET_KEY</code> on Vercel, then redeploy.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Back to home
          </Link>
        </div>
      </Container>
    );
  }

  return <AccountOrdersClerk />;
}
