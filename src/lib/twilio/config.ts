/**
 * Twilio server configuration — all read from environment variables.
 * NOTHING is hardcoded: set these in Vercel (and .env.local), never in
 * source. See DEPLOY.md → "Twilio dialer & texting".
 *
 *   TWILIO_ACCOUNT_SID     AC… (your Account SID)
 *   TWILIO_API_KEY_SID     SK… (Standard API Key SID)
 *   TWILIO_API_KEY_SECRET  the API Key secret (rotate if ever exposed)
 *   TWILIO_TWIML_APP_SID   AP… (TwiML App for browser Voice; outgoing)
 *   TWILIO_PHONE_NUMBER    +1… (E.164 — caller ID + SMS "from")
 */
export const TWILIO = {
  accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() || "",
  apiKeySid: process.env.TWILIO_API_KEY_SID?.trim() || "",
  apiKeySecret: process.env.TWILIO_API_KEY_SECRET?.trim() || "",
  appSid: process.env.TWILIO_TWIML_APP_SID?.trim() || "",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER?.trim() || "",
};

/** Browser dialing (Voice SDK) needs the API key + a TwiML App SID. */
export function twilioVoiceConfigured(): boolean {
  return Boolean(
    TWILIO.accountSid &&
      TWILIO.apiKeySid &&
      TWILIO.apiKeySecret &&
      TWILIO.appSid
  );
}

/** Outbound SMS needs the API key + a "from" number. */
export function twilioSmsConfigured(): boolean {
  return Boolean(
    TWILIO.accountSid &&
      TWILIO.apiKeySid &&
      TWILIO.apiKeySecret &&
      TWILIO.phoneNumber
  );
}
