import { encoder, fromBase64Url, safeEqual, toBase64Url } from "./encoding";

const ITERATIONS = 210_000;
const KEY_BITS = 256;

export type PasswordHash = {
  hash: string;
  salt: string;
  iterations: number;
};

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_BITS,
  );
  return toBase64Url(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    hash: await derive(password, salt, ITERATIONS),
    salt: toBase64Url(salt),
    iterations: ITERATIONS,
  };
}

export async function verifyPassword(password: string, stored: PasswordHash) {
  const candidate = await derive(password, fromBase64Url(stored.salt), stored.iterations);
  return safeEqual(candidate, stored.hash);
}
