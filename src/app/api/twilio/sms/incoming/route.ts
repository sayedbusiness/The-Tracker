export const runtime = "edge";

/**
 * POST /api/twilio/sms/incoming  ← your TwiML App's Messaging Request URL
 * (or set it directly on the phone number's Messaging webhook).
 *
 * Acknowledges inbound texts with empty TwiML so Twilio doesn't auto-reply.
 * Threading inbound messages back to a specific user requires mapping the
 * Twilio number → account; that's a future enhancement, so for now we just
 * accept the webhook cleanly.
 */
export async function POST() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  return new Response(xml, {
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}
