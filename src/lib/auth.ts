import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  isValidSession,
  matchesSecret,
  signSession,
} from "./session";

const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

export async function isValidCredentials(user: string, password: string) {
  const expectedUser = process.env.APP_USER ?? "";
  const expectedPassword = process.env.APP_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) return false;
  try {
    const key = secret();
    const [userOk, passwordOk] = await Promise.all([
      matchesSecret(key, user, expectedUser),
      matchesSecret(key, password, expectedPassword),
    ]);
    return userOk && passwordOk;
  } catch {
    return false;
  }
}

export async function createSession() {
  const token = await signSession(secret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function isLoggedIn() {
  const jar = await cookies();
  return isValidSession(jar.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
}
