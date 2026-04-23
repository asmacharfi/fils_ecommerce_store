"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { CLERK_UI_ENABLED } from "@/lib/clerk-public";

function NavbarActionsClerkless() {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, openChat } = useAIChatPanel();
  const itemCount = useCart((state) => state.items.reduce((n, line) => n + line.quantity, 0));
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          Assistant IA
        </button>
      )}
      <Button onClick={() => router.push("/cart")} className="flex items-center rounded-full bg-black px-4 py-2">
        <ShoppingBag size={20} color="white" />
        <span className="ml-2 text-sm font-medium text-white">{itemCount}</span>
      </Button>
    </div>
  );
}

function NavbarActionsWithClerk() {
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
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            Connexion
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link
          href="/account/orders"
          className="max-w-[6rem] truncate text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white sm:max-w-none"
        >
          Mes commandes
        </Link>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
      </SignedIn>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40"
        >
          <Sparkles className="h-4 w-4" />
          Assistant IA
        </button>
      )}
      <Button onClick={() => router.push("/cart")} className="flex items-center rounded-full bg-black px-4 py-2">
        <ShoppingBag size={20} color="white" />
        <span className="ml-2 text-sm font-medium text-white">{itemCount}</span>
      </Button>
    </div>
  );
}

export default function NavbarActions() {
  return CLERK_UI_ENABLED ? <NavbarActionsWithClerk /> : <NavbarActionsClerkless />;
}