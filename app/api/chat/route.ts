import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import {
  parseChatToolRequestContext,
  parseCurrentProductContext,
  toCheapestInCategoryRequestContext,
  toSimilarProductsRequestContext,
} from "@/lib/ai/request-context";
import { resolveCurrentProductContextFromPathname } from "@/lib/ai/resolve-path-product-context";
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

function isCheapProductsTurn(messageText: string) {
  return /\b(cheap|affordable|budget|inexpensive|bargain|lowest|low|discount|on sale|clearance|deal|deals)\b/i.test(
    messageText
  );
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
      clientPathname?: string;
    };

    const uiMessages = Array.isArray(body.messages) ? body.messages : [];
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "";
    const clientPathname = typeof body.clientPathname === "string" ? body.clientPathname : "";
    const explicitRequestContext = parseChatToolRequestContext(body.requestContext);
    let currentProductContext = parseCurrentProductContext(body.currentProductContext);
    if (!currentProductContext && clientPathname) {
      currentProductContext = await resolveCurrentProductContextFromPathname(clientPathname);
    }
    const lastUserText = getLastUserMessageText(uiMessages);

    let inferredRequestContext = null;
    if (!explicitRequestContext && currentProductContext) {
      if (isSimilarProductsTurn(lastUserText)) {
        inferredRequestContext = toSimilarProductsRequestContext(currentProductContext);
      } else if (isCheapProductsTurn(lastUserText)) {
        inferredRequestContext = toCheapestInCategoryRequestContext(currentProductContext);
      }
    }
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
