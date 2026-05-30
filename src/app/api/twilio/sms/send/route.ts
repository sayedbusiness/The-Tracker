import type { NextRequest } from "next/server";
import { TWILIO, twilioSmsConfigured } from "@/lib/twilio/config";

export const runtime = "edge";

/**
 * POST /api/twilio/sms/send   body: { to: string, body: string }
 *
 * Sends an SMS from your Twilio number via the REST API, authenticated
 * with your API Key (SID:secret as Basic auth). 503 when unconfigured.
 */
export async function POST(req: NextRequest) {
  if (!twilioSmsConfigured()) {
    return Response.json(
      { configured: false, error: "Twilio SMS not configured" },
      { status: 503 }
    );
  }

  let to = "";
  let text = "";
  try {
    const json = (await req.json()) as { to?: string; body?: string };
    to = (json.to ?? "").trim();
    text = (json.body ?? "").trim();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!to || !text) {
    return Response.json({ error: "Both 'to' and 'body' are required" }, { status: 400 });
  }

  const auth = btoa(`${TWILIO.apiKeySid}:${TWILIO.apiKeySecret}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO.accountSid}/Messages.json`;
  const params = new URLSearchParams({ To: to, From: TWILIO.phoneNumber, Body: text });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = (await res.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
    code?: number;
  };

  if (!res.ok) {
    return Response.json(
      { error: data.message || `Twilio error ${res.status}`, code: data.code },
      { status: res.status }
    );
  }

  return Response.json({ ok: true, sid: data.sid });
}
