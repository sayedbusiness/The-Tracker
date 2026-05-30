/**
 * Twilio Voice Access Token (JWT) generator.
 *
 * Hand-rolled with Web Crypto so it runs on the edge with no SDK. Produces
 * the exact token shape the Twilio Voice JS SDK expects:
 *   - header `cty: "twilio-fpa;v=1"`, HS256
 *   - grants.voice.outgoing.application_sid → your TwiML App
 *   - grants.voice.incoming.allow → accept inbound browser calls
 * Signed HS256 with the API Key secret.
 */

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlFromString(s: string): string {
  return b64urlFromBytes(new TextEncoder().encode(s));
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export async function createVoiceToken(opts: {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  appSid: string;
  identity: string;
  ttlSeconds?: number;
}): Promise<string> {
  const { accountSid, apiKeySid, apiKeySecret, appSid, identity } = opts;
  const ttl = opts.ttlSeconds ?? 3600;
  const now = Math.floor(Date.now() / 1000);

  const header = { cty: "twilio-fpa;v=1", typ: "JWT", alg: "HS256" };
  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    sub: accountSid,
    nbf: now,
    exp: now + ttl,
    grants: {
      identity,
      voice: {
        incoming: { allow: true },
        outgoing: { application_sid: appSid },
      },
    },
  };

  const signingInput = `${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(
    JSON.stringify(payload)
  )}`;
  const signature = b64urlFromBytes(await hmacSha256(apiKeySecret, signingInput));
  return `${signingInput}.${signature}`;
}
