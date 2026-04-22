"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { getStoreApiRoot } from "@/lib/get-store-api-root";
import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";

interface AIContextValue {
  pageContext: string;
  /** Set on product detail routes when the product payload is loaded. */
  viewerProduct: ChatViewerProduct | null;
}

const AIContext = createContext<AIContextValue>({
  pageContext: "Browsing products",
  viewerProduct: null,
});

const formatPrice = (value: string | number | undefined) => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? "$0.00" : `$${numeric.toFixed(2)}`;
};

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [pageContext, setPageContext] = useState("Browsing products");
  const [viewerProduct, setViewerProduct] = useState<ChatViewerProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateContext = async () => {
      if (pathname === "/") {
        if (isMounted) {
          setPageContext("Browsing products on the homepage.");
          setViewerProduct(null);
        }
        return;
      }

      const apiUrl = getStoreApiRoot();
      if (!apiUrl) {
        if (isMounted) {
          setPageContext("Browsing products.");
          setViewerProduct(null);
        }
        return;
      }

      if (pathname.startsWith("/product/")) {
        const productId = pathname.split("/")[2];
        if (!productId) {
          if (isMounted) {
            setPageContext("Browsing product details.");
            setViewerProduct(null);
          }
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/products/${productId}`, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed product context");
          const product = await response.json();
          const nextContext = `Viewing product ${product?.name || "Unknown"} in ${
            product?.category?.name || "General"
          } category priced at ${formatPrice(product?.price)}.`;
          const catId = product?.category?.id as string | undefined;
          if (isMounted) {
            setPageContext(nextContext);
            if (product?.id && catId) {
              setViewerProduct({
                id: String(product.id),
                name: String(product.name ?? ""),
                categoryId: String(catId),
              });
            } else {
              setViewerProduct(null);
            }
          }
          return;
        } catch {
          if (isMounted) {
            setPageContext("Browsing product details.");
            setViewerProduct(null);
          }
          return;
        }
      }

      if (pathname.startsWith("/category/")) {
        const categoryId = pathname.split("/")[2];
        if (!categoryId) {
          if (isMounted) {
            setPageContext("Browsing a category listing.");
            setViewerProduct(null);
          }
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/categories/${categoryId}`, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed category context");
          const category = await response.json();
          const nextContext = `Browsing category ${category?.name || "Unknown"} with filtered products.`;
          if (isMounted) {
            setPageContext(nextContext);
            setViewerProduct(null);
          }
          return;
        } catch {
          if (isMounted) {
            setPageContext("Browsing a category listing.");
            setViewerProduct(null);
          }
          return;
        }
      }

      if (isMounted) {
        setPageContext("Browsing products.");
        setViewerProduct(null);
      }
    };

    updateContext();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const value = useMemo(() => ({ pageContext, viewerProduct }), [pageContext, viewerProduct]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAIContext = () => useContext(AIContext);
