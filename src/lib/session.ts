// Web Crypto only: este módulo roda tanto no Node (server actions, páginas)
// quanto no Edge Runtime (middleware). O middleware valida a assinatura sem
// tocar no banco, então o nome do usuário viaja dentro do próprio token.

import { decodeText, encodeText, encoder, safeEqual, toBase64Url } from "./encoding";

export const SESSION_COOKIE = "roteiro_session";

// Sessões emitidas antes do cadastro de usuários usavam este payload fixo.
const LEGACY_PAYLOAD = "ok";

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

export async function signSession(secret: string, username: string) {
  const payload = encodeText(username);
  return `${payload}.${await hmac(secret, payload)}`;
}

/** Devolve o usuário da sessão, ou null se o token for inválido. */
export async function readSession(
  token: string | undefined,
  secret: string | undefined,
): Promise<string | null> {
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, await hmac(secret, payload))) return null;
  if (payload === LEGACY_PAYLOAD) return process.env.APP_USER ?? LEGACY_PAYLOAD;
  try {
    return decodeText(payload) || null;
  } catch {
    return null;
  }
}

// Compara segredos pelos digests, para o resultado não depender do tamanho
// do texto em claro.
export async function matchesSecret(secret: string, left: string, right: string) {
  const [a, b] = await Promise.all([hmac(secret, left), hmac(secret, right)]);
  return safeEqual(a, b);
}
