import { verifyToken } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";
import { isClerkSecretConfigured } from "@/lib/clerk-server";
import { getStoreApiRoot } from "@/lib/get-store-api-root";

function parseChatViewerProduct(input: unknown): ChatViewerProduct | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const categoryId = typeof o.categoryId === "string" ? o.categoryId.trim() : "";
  if (!id || !categoryId) return null;
  return { id, name, categoryId };
}

function parseShopperId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)) {
    return null;
  }
  return s;
}

function parseCartProductIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === "string" && x.trim()) out.push(x.trim());
  }
  return out;
}

/** `/api/chat` is a public route: `auth()` often has no session here. Prefer Bearer from the client (Clerk session JWT). */
async function resolveClerkSession(req: Request): Promise<{ userId: string | null; token: string | null }> {
  let userId: string | null = null;
  let token: string | null = null;

  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const raw = header.slice(7).trim();
    const secretKey = process.env.CLERK_SECRET_KEY?.trim();
    if (raw && secretKey) {
      try {
        // @clerk/backend@0.38 VerifyTokenOptions typing is stricter than runtime; options are valid for session JWTs.
        const payload = await verifyToken(raw, {
          secretKey,
          clockSkewInMs: 120_000,
        } as Parameters<typeof verifyToken>[1]);
        const sub = typeof payload.sub === "string" ? payload.sub : null;
        if (sub) {
          userId = sub;
          token = raw;
        }
      } catch {
        // ignore invalid bearer
      }
    }
  }

  if (!userId && isClerkSecretConfigured()) {
    const session = auth();
    userId = session.userId ?? null;
    token = token ?? (await session.getToken()) ?? null;
  }

  return { userId, token };
}

export async function POST(req: Request) {
  try {
    const modelEnvError = getChatModelEnvError();
    if (modelEnvError) {
      return NextResponse.json({ error: modelEnvError }, { status: 500 });
    }

    if (!getStoreApiRoot()) {
      return NextResponse.json(
        { error: "Product API URL is not configured." },
        { status: 500 }
      );
    }

    const { userId, token } = await resolveClerkSession(req);

    const body = (await req.json()) as {
      messages?: unknown[];
      pageContext?: string;
      viewerProduct?: unknown;
      shopperId?: unknown;
      browseSummary?: unknown;
      cartProductIds?: unknown;
    };

    const uiMessages = Array.isArray(body.messages) ? body.messages : [];
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "";
    const viewerProduct = parseChatViewerProduct(body.viewerProduct);
    const shopperId = parseShopperId(body.shopperId);
    const browseSummary = typeof body.browseSummary === "string" ? body.browseSummary : "";
    const cartProductIds = parseCartProductIds(body.cartProductIds);

    const agent = createShoppingAgent({
      pageContext,
      viewerProduct,
      clerkUserId: userId ?? null,
      shopperId,
      browseSummary,
      cartProductIds,
      getToken: async () => token ?? null,
    });

    return await createAgentUIStreamResponse({
      agent,
      uiMessages,
    });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
