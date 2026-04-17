import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  context: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

const assistantResponseSchema = z.object({
  type: z.enum(["products", "message"]),
  content: z.string().optional(),
  productIds: z.array(z.string()).max(8).optional(),
});

interface APIProduct {
  id: string;
  name: string;
  price: string | number;
  isArchived?: boolean;
  images: Array<{ id: string; url: string }>;
  category: { id: string; name: string };
  size: { id: string; name: string; value: string };
  color: { id: string; name: string; value: string };
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { type: "message", content: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const parsedBody = chatRequestSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { type: "message", content: "Invalid chat payload." },
        { status: 400 }
      );
    }

    const { message, context, history = [] } = parsedBody.data;
    const productApiUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/products`
      : "";

    if (!productApiUrl) {
      return NextResponse.json(
        { type: "message", content: "Product API URL is not configured." },
        { status: 500 }
      );
    }

    // Reuse existing public products API backed by Prisma query.
    const productsResponse = await fetch(productApiUrl, { cache: "no-store" });
    if (!productsResponse.ok) {
      return NextResponse.json(
        { type: "message", content: "Unable to fetch product catalog right now." },
        { status: 500 }
      );
    }

    const products = ((await productsResponse.json()) as APIProduct[]).filter(
      (item) => item.isArchived !== true
    );

    if (!products.length) {
      return NextResponse.json({
        type: "message",
        content: "There are no active products to recommend right now.",
      });
    }

    const productCatalogForPrompt = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      description: "",
      category: product.category?.name || "General",
      image: product.images?.[0]?.url || "",
    }));

    const historyText = history.map((item) => `${item.role}: ${item.content}`).join("\n");

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: assistantResponseSchema,
      prompt: `
You are a shopping assistant for an e-commerce store.

Rules:
- Only recommend products from the provided product list.
- If the user asks for product recommendations, return:
  { "type": "products", "content": "...", "productIds": ["..."] }
- If the user asks a general question, return:
  { "type": "message", "content": "..." }
- Use page context for requests like "similar to this".
- Prefer products that best match filters like cheap, under price, category, best.

Page context:
${context || "Browsing products"}

Chat history:
${historyText || "No prior history"}

User message:
${message}

Available products JSON:
${JSON.stringify(productCatalogForPrompt)}
      `.trim(),
    });

    const decision = result.object;

    if (decision.type === "products") {
      const selectedIds = decision.productIds || [];
      const selectedProducts = products.filter((product) => selectedIds.includes(product.id)).slice(0, 8);

      return NextResponse.json({
        type: "products",
        content: decision.content || "Here are the best matches I found.",
        products: selectedProducts,
      });
    }

    return NextResponse.json({
      type: "message",
      content: decision.content || "How can I help you find the right product?",
    });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return NextResponse.json(
      { type: "message", content: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
