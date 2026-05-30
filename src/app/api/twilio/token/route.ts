import type { NextRequest } from "next/server";
import { TWILIO, twilioVoiceConfigured } from "@/lib/twilio/config";
import { createVoiceToken } from "@/lib/twilio/token";

export const runtime = "edge";

/**
 * GET /api/twilio/token?identity=...
 *
 * Returns a short-lived Twilio Voice access token for the browser dialer.
 * 503 when Twilio Voice isn't configured (the UI shows a "connect" card).
 */
export async function GET(req: NextRequest) {
  if (!twilioVoiceConfigured()) {
    return Response.json(
      { configured: false, error: "Twilio Voice not configured" },
      { status: 503 }
    );
  }

  const identity =
    req.nextUrl.searchParams.get("identity")?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) ||
    "apex-operator";

  try {
    const token = await createVoiceToken({
      accountSid: TWILIO.accountSid,
      apiKeySid: TWILIO.apiKeySid,
      apiKeySecret: TWILIO.apiKeySecret,
      appSid: TWILIO.appSid,
      identity,
    });
    return Response.json({
      configured: true,
      token,
      identity,
      callerId: TWILIO.phoneNumber || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token error";
    return Response.json({ configured: true, error: message }, { status: 500 });
  }
}
