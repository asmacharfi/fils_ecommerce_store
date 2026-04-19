import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";

import { getChatModelEnvError } from "@/lib/ai/create-chat-model";
import { createGuestShoppingAgent } from "@/lib/ai/shopping-agent";

export async function POST(req: Request) {
  try {
    const modelEnvError = getChatModelEnvError();
    if (modelEnvError) {
      return NextResponse.json({ error: modelEnvError }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      return NextResponse.json(
        { error: "Product API URL is not configured." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      messages?: unknown[];
      pageContext?: string;
    };

    const uiMessages = Array.isArray(body.messages) ? body.messages : [];
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "";

    const agent = createGuestShoppingAgent(pageContext);

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
