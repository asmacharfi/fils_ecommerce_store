"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "store-shopper-id-v1";

function readId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return null;
  }
}

/** Stable pseudonymous id for recommendations & checkout (guest profile). */
export function useShopperId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(readId());
  }, []);

  return id;
}

export function getShopperIdSync(): string | null {
  return readId();
}
