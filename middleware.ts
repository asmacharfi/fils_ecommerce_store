import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
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

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
