/**
 * Clerk calls atob() on the publishable key during the build. A stray trailing
 * `$`, newlines, or other paste artifacts yield DOMException InvalidCharacterError
 * and fail "Collecting page data". Normalize before any Next/Clerk code runs.
 */
function normalizeClerkPublishableKey() {
  const raw = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (typeof raw !== "string" || !raw.trim()) return;
  let v = raw.trim().replace(/[\r\n\t]/g, "");
  if (v.endsWith("$")) v = v.slice(0, -1);
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = v;
}

function normalizeClerkSecretKey() {
  const raw = process.env.CLERK_SECRET_KEY;
  if (typeof raw !== "string" || !raw.trim()) return;
  process.env.CLERK_SECRET_KEY = raw.trim().replace(/[\r\n\t]/g, "");
}

normalizeClerkPublishableKey();
normalizeClerkSecretKey();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "tailwindui.com",
      "res.cloudinary.com",
    ],
    // next/image rejects unknown hostnames at runtime ("Invalid src prop") unless listed here.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "imagedelivery.net", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "*.googleusercontent.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
