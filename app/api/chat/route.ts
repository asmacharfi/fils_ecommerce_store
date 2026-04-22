import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import {
  parseCurrentProductContext,
  parseSimilarProductsRequestContext,
  toSimilarProductsRequestContext,
} from "@/lib/ai/request-context";
import { createGuestShoppingAgent } from "@/lib/ai/shopping-agent";
import { getStoreApiRoot } from "@/lib/get-store-api-root";

function getLastUserMessageText(messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (!message || typeof message !== "object") continue;

    const role = (message as { role?: unknown }).role;
    if (role !== "user") continue;

    const parts = (message as { parts?: unknown }).parts;
    if (!Array.isArray(parts)) return "";

    return parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          Boolean(
            part &&
              typeof part === "object" &&
              (part as { type?: unknown }).type === "text" &&
              typeof (part as { text?: unknown }).text === "string"
          )
      )
      .map((part) => part.text)
      .join(" ")
      .trim();
  }

  return "";
}

function isSimilarProductsTurn(messageText: string) {
  return /\b(similar|alternatives?)\b/i.test(messageText);
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
      requestContext?: unknown;
      currentProductContext?: unknown;
    };

    const uiMessages = Array.isArray(body.messages) ? body.messages : [];
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "";
    const explicitRequestContext = parseSimilarProductsRequestContext(body.requestContext);
    const currentProductContext = parseCurrentProductContext(body.currentProductContext);
    const inferredRequestContext =
      !explicitRequestContext &&
      currentProductContext &&
      isSimilarProductsTurn(getLastUserMessageText(uiMessages))
        ? toSimilarProductsRequestContext(currentProductContext)
        : null;
    const requestContext = explicitRequestContext ?? inferredRequestContext;

    const agent = createGuestShoppingAgent(pageContext, requestContext);

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
