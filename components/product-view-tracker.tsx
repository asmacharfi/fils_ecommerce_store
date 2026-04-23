"use client";

import { useEffect } from "react";

import { useBrowseHistory } from "@/hooks/use-browse-history";

type Props = {
  productId: string;
  categoryId: string;
};

export function ProductViewTracker({ productId, categoryId }: Props) {
  const recordView = useBrowseHistory((s) => s.recordView);

  useEffect(() => {
    recordView(productId, categoryId);
  }, [productId, categoryId, recordView]);

  return null;
}
