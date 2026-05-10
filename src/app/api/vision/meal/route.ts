import type { NextRequest } from "next/server";
import { analyzeMealPhoto } from "@/lib/ai/vision";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return Response.json(
        { error: "Missing 'photo' file in form data" },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return Response.json(
        { error: "Photo too large (max 8 MB)" },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(bytes);
    const mimeType = file.type || "image/jpeg";

    const analysis = await analyzeMealPhoto(base64, mimeType);
    return Response.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vision failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
