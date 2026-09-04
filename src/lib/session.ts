// Web Crypto only: this module runs both in the Node.js runtime (server
// actions, pages) and in the Edge runtime (middleware).

export const SESSION_COOKIE = "roteiro_session";
export const SESSION_VALUE = "ok";

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function equals(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

export async function signSession(secret: string) {
  return `${SESSION_VALUE}.${await hmac(secret, SESSION_VALUE)}`;
}

export async function isValidSession(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [value, signature] = token.split(".");
  if (value !== SESSION_VALUE || !signature) return false;
  return equals(signature, await hmac(secret, value));
}

// Compares secrets through their digests so the check does not depend on the
// plaintext length.
export async function matchesSecret(secret: string, left: string, right: string) {
  const [a, b] = await Promise.all([hmac(secret, left), hmac(secret, right)]);
  return equals(a, b);
}
