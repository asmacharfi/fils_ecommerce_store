import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import { createGuestShoppingAgent } from "@/lib/ai/shopping-agent";
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

    const body = (await req.json()) as {
      messages?: unknown[];
      pageContext?: string;
      viewerProduct?: unknown;
    };

    const uiMessages = Array.isArray(body.messages) ? body.messages : [];
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "";
    const viewerProduct = parseChatViewerProduct(body.viewerProduct);

    const agent = createGuestShoppingAgent(pageContext, viewerProduct);

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
