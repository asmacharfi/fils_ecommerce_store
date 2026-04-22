"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { getStoreApiRoot } from "@/lib/get-store-api-root";
import type { CurrentProductContext } from "@/lib/ai/request-context";

interface AIContextValue {
  pageContext: string;
  /** Next.js pathname; always in sync (unlike client-fetched product context). */
  clientPathname: string;
  currentProductContext: CurrentProductContext | null;
}

const AIContext = createContext<AIContextValue>({
  pageContext: "Browsing products",
  clientPathname: "",
  currentProductContext: null,
});

const formatPrice = (value: string | number | undefined) => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? "$0.00" : `$${numeric.toFixed(2)}`;
};

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [pageContext, setPageContext] = useState("Browsing products");
  const [currentProductContext, setCurrentProductContext] =
    useState<CurrentProductContext | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateContext = async () => {
      if (pathname === "/") {
        if (isMounted) {
          setPageContext("Browsing products on the homepage.");
          setCurrentProductContext(null);
        }
        return;
      }

      const apiUrl = getStoreApiRoot();
      if (!apiUrl) {
        if (isMounted) {
          setPageContext("Browsing products.");
          setCurrentProductContext(null);
        }
        return;
      }

      if (pathname.startsWith("/product/")) {
        const productId = pathname.split("/")[2];
        if (!productId) {
          if (isMounted) setPageContext("Browsing product details.");
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/products/${productId}`, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed product context");
          const product = await response.json();
          const nextContext = `Viewing product ${product?.name || "Unknown"} in ${
            product?.category?.name || "General"
          } category priced at ${formatPrice(product?.price)}.`;
          if (isMounted) {
            setPageContext(nextContext);
            setCurrentProductContext(
              product?.id && product?.name && product?.category?.id && product?.category?.name
                ? {
                    productId: product.id,
                    productName: product.name,
                    categoryId: product.category.id,
                    categoryName: product.category.name,
                  }
                : null
            );
          }
          return;
        } catch {
          if (isMounted) {
            setPageContext("Browsing product details.");
            setCurrentProductContext(null);
          }
          return;
        }
      }

      if (pathname.startsWith("/category/")) {
        const categoryId = pathname.split("/")[2];
        if (!categoryId) {
          if (isMounted) setPageContext("Browsing a category listing.");
          return;
        }

        try {
          const response = await fetch(`${apiUrl}/categories/${categoryId}`, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed category context");
          const category = await response.json();
          const nextContext = `Browsing category ${category?.name || "Unknown"} with filtered products.`;
          if (isMounted) {
            setPageContext(nextContext);
            setCurrentProductContext(null);
          }
          return;
        } catch {
          if (isMounted) {
            setPageContext("Browsing a category listing.");
            setCurrentProductContext(null);
          }
          return;
        }
      }

      if (isMounted) {
        setPageContext("Browsing products.");
        setCurrentProductContext(null);
      }
    };

    updateContext();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const value = useMemo(
    () => ({ pageContext, clientPathname: pathname ?? "", currentProductContext }),
    [pageContext, pathname, currentProductContext]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAIContext = () => useContext(AIContext);
