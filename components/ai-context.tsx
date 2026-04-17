"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface AIContextValue {
  pageContext: string;
}

const AIContext = createContext<AIContextValue>({
  pageContext: "Browsing products",
});

const formatPrice = (value: string | number | undefined) => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? "$0.00" : `$${numeric.toFixed(2)}`;
};

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [pageContext, setPageContext] = useState("Browsing products");

  useEffect(() => {
    let isMounted = true;

    const updateContext = async () => {
      if (pathname === "/") {
        if (isMounted) setPageContext("Browsing products on the homepage.");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        if (isMounted) setPageContext("Browsing products.");
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
          if (isMounted) setPageContext(nextContext);
          return;
        } catch {
          if (isMounted) setPageContext("Browsing product details.");
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
          if (isMounted) setPageContext(nextContext);
          return;
        } catch {
          if (isMounted) setPageContext("Browsing a category listing.");
          return;
        }
      }

      if (isMounted) setPageContext("Browsing products.");
    };

    updateContext();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const value = useMemo(() => ({ pageContext }), [pageContext]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAIContext = () => useContext(AIContext);
