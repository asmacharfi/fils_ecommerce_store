"use client";

import { ShoppingBag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";

const NavbarActions = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, openChat } = useAIChatPanel();
  const itemCount = useCart((state) => state.items.reduce((n, line) => n + line.quantity, 0));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-3 sm:gap-x-4">
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>
      )}
      <Button onClick={() => router.push('/cart')} className="flex items-center rounded-full bg-black px-4 py-2">
        <ShoppingBag
          size={20}
          color="white"
        />
        <span className="ml-2 text-sm font-medium text-white">
          {itemCount}
        </span>
      </Button>
    </div>
  );
}
 
export default NavbarActions;