"use client";

import { ClerkLoaded, ClerkLoading, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingBag, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAIChatPanel } from "@/components/ai-chat-panel-context";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { CLERK_UI_ENABLED } from "@/lib/clerk-public";

const MY_ORDERS_LINK_CLASS =
  "max-w-[6.5rem] truncate text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white sm:max-w-none";

/** Outline user icon — matches “sign in / profile” affordance in the header */
const SIGN_IN_ICON_BUTTON_CLASS =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-600 outline-none ring-offset-white transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:ring-offset-zinc-950 dark:hover:bg-zinc-800";

const AI_BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40";

function SignInIconTrigger() {
  return (
    <SignInButton mode="modal" redirectUrl="/account/orders">
      <button type="button" className={SIGN_IN_ICON_BUTTON_CLASS} aria-label="Sign in">
        <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </button>
    </SignInButton>
  );
}

function AiChatTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={AI_BUTTON_CLASS}>
      <Sparkles className="h-4 w-4" />
      Shopping assistant
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
      <Link href="/sign-in" prefetch={false} className={SIGN_IN_ICON_BUTTON_CLASS} aria-label="Sign in">
        <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
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
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInIconTrigger />
        </SignedOut>
        <SignedIn>
          <Link href="/orders" prefetch={false} className={MY_ORDERS_LINK_CLASS}>
            My orders
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
