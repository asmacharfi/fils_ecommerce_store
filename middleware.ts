import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { isClerkSecretConfigured } from "@/lib/clerk-server";

const clerk = authMiddleware({
  publicRoutes: [
    "/",
    "/cart(.*)",
    "/category(.*)",
    "/product(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/chat",
  ],
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkSecretConfigured()) {
    return NextResponse.next();
  }
  return clerk(request, event);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
