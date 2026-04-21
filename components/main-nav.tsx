"use client";

import Link from "next/link"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { cn } from "@/lib/utils"
import { Category } from "@/types";

const MainNav: React.FC = () => {
  const pathname = usePathname();
  const [data, setData] = useState<Category[]>([]);

  useEffect(() => {
    const apiUrl = getStoreApiRoot();
    if (!apiUrl) return;

    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/categories`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const json = await response.json();
        if (isMounted && Array.isArray(json)) {
          setData(json);
        }
      } catch {
        // Keep the nav usable even if the catalog API is temporarily unavailable.
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const routes = data.map((route) => ({
    href: `/category/${route.id}`,
    label: route.name,
    active: pathname === `/category/${route.id}`,
  }));

  return (
    <nav
      className="mx-6 flex items-center space-x-4 lg:space-x-6"
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-black',
            route.active ? 'text-black' : 'text-neutral-500'
          )}
        >
          {route.label}
      </Link>
      ))}
    </nav>
  )
};

export default MainNav;
