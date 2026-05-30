import type { NextRequest } from "next/server";
import { TWILIO } from "@/lib/twilio/config";

export const runtime = "edge";

/**
 * POST /api/twilio/voice  ← this is your TwiML App's Voice Request URL.
 *
 * When the browser dialer connects with a `To` param, Twilio hits this
 * endpoint and we return TwiML that bridges the call from your Twilio
 * number to the dialed number.
 */
export async function POST(req: NextRequest) {
  let to = "";
  try {
    const form = await req.formData();
    to = String(form.get("To") ?? "").trim();
  } catch {
    // Twilio always posts form-encoded; ignore parse errors.
  }

  const callerId = TWILIO.phoneNumber;
  const xml = to
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Dial${
        callerId ? ` callerId="${escapeXml(callerId)}"` : ""
      } answerOnBridge="true"><Number>${escapeXml(to)}</Number></Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number was provided.</Say></Response>`;

  return new Response(xml, {
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
