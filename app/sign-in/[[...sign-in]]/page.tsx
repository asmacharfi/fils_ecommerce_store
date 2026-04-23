import { SignIn } from "@clerk/nextjs";

import { CLERK_UI_ENABLED } from "@/lib/clerk-public";

export default function SignInPage() {
  if (!CLERK_UI_ENABLED) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Connexion indisponible</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Configurez Clerk sur ce déploiement (variables <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> et{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">CLERK_SECRET_KEY</code>), puis redéployez.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] justify-center px-4 py-16">
      <SignIn
        appearance={{
          elements: { rootBox: "mx-auto", card: "shadow-lg" },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/account/orders"
        afterSignUpUrl="/account/orders"
      />
    </div>
  );
}
