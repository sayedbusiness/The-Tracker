import type { NextRequest } from "next/server";
import { analyzeMealText } from "@/lib/ai/vision";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string; amount?: string };
    const text = (body.text ?? "").trim();
    if (!text) {
      return Response.json(
        { error: "Missing 'text' (ingredients, product name, or barcode)" },
        { status: 400 }
      );
    }
    const analysis = await analyzeMealText(text, (body.amount ?? "").trim());
    return Response.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vision failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
