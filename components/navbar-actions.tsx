"use client";

import { ClerkLoaded, ClerkLoading, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { CLERK_UI_ENABLED } from "@/lib/clerk-public";

const CONNEXION_LINK_CLASS =
  "text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200";

const ACCOUNT_LINK_CLASS =
  "text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-white";

const AI_BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40";

function AiChatTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={AI_BUTTON_CLASS}>
      <Sparkles className="h-4 w-4" />
      Assistant IA
    </button>
  );
}

function CartTrigger({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick} className="flex items-center rounded-full bg-black px-4 py-2">
      <ShoppingBag size={20} color="white" />
      <span className="ml-2 text-sm font-medium text-white">{count}</span>
    </Button>
  );
}

function NavbarActionsClerkless() {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, openChat } = useAIChatPanel();
  const itemCount = useCart((state) => state.items.reduce((n, line) => n + line.quantity, 0));
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartCount = isMounted ? itemCount : 0;

  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3">
      <Link href="/sign-in" prefetch={false} className={CONNEXION_LINK_CLASS}>
        Connexion
      </Link>
      <Link href="/sign-in" prefetch={false} className={ACCOUNT_LINK_CLASS}>
        Mon compte
      </Link>
      {!isOpen && <AiChatTrigger onClick={openChat} />}
      <CartTrigger count={cartCount} onClick={() => router.push("/cart")} />
    </div>
  );
}

function NavbarActionsWithClerk() {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, openChat } = useAIChatPanel();
  const itemCount = useCart((state) => state.items.reduce((n, line) => n + line.quantity, 0));
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartCount = isMounted ? itemCount : 0;

  return (
    <div className="flex max-w-full min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3">
      <ClerkLoading>
        <div className="h-4 w-24 max-w-[6.5rem] animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 sm:max-w-none" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <SignInButton mode="modal" redirectUrl="/account/orders">
              <button type="button" className={CONNEXION_LINK_CLASS}>
                Connexion
              </button>
            </SignInButton>
            <Link href="/sign-in" prefetch={false} className={ACCOUNT_LINK_CLASS}>
              Mon compte
            </Link>
          </div>
        </SignedOut>
        <SignedIn>
          <Link
            href="/orders"
            prefetch={false}
            className="max-w-[6.5rem] truncate text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white sm:max-w-none"
          >
            Mes commandes
          </Link>
        </SignedIn>
      </ClerkLoaded>

      {!isOpen && <AiChatTrigger onClick={openChat} />}
      <CartTrigger count={cartCount} onClick={() => router.push("/cart")} />

      <ClerkLoaded>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            userProfileUrl="/account/orders"
            appearance={{ elements: { avatarBox: "h-9 w-9" } }}
          />
        </SignedIn>
      </ClerkLoaded>
    </div>
  );
}

export default function NavbarActions() {
  return CLERK_UI_ENABLED ? <NavbarActionsWithClerk /> : <NavbarActionsClerkless />;
}
