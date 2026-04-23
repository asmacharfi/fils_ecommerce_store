import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
