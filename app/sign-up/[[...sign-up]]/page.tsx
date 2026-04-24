import { SignUp } from "@clerk/nextjs";

import { CLERK_UI_ENABLED } from "@/lib/clerk-public";

export default function SignUpPage() {
  if (!CLERK_UI_ENABLED) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Sign-up unavailable</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Configure Clerk on this deployment, then redeploy.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] justify-center px-4 py-16">
      <SignUp
        appearance={{
          elements: { rootBox: "mx-auto", card: "shadow-lg" },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/account/orders"
      />
    </div>
  );
}
