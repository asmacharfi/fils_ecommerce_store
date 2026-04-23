import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";
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

    const { userId, getToken } = auth();
    const token = await getToken();

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
      getToken: async () => token,
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
