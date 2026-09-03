import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "roteiro_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function sameSecret(left: string, right: string) {
  const a = createHmac("sha256", secret()).update(left).digest();
  const b = createHmac("sha256", secret()).update(right).digest();
  return timingSafeEqual(a, b);
}

export function isValidCredentials(user: string, password: string) {
  const expectedUser = process.env.APP_USER ?? "";
  const expectedPassword = process.env.APP_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) return false;
  try {
    return sameSecret(user, expectedUser) && sameSecret(password, expectedPassword);
  } catch {
    return false;
  }
}

export async function createSession() {
  const token = `ok.${sign("ok")}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isLoggedIn() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  try {
    return (
      value === "ok" &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}
