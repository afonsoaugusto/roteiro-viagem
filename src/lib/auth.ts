import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, matchesSecret, readSession, signSession } from "./session";
import { verifyUser } from "./users";

const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

/** Acesso de emergência por variável de ambiente, independente do banco. */
async function checkEnvCredentials(user: string, password: string) {
  const expectedUser = process.env.APP_USER ?? "";
  const expectedPassword = process.env.APP_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) return null;
  const key = secret();
  const [userOk, passwordOk] = await Promise.all([
    matchesSecret(key, user.trim().toLowerCase(), expectedUser.trim().toLowerCase()),
    matchesSecret(key, password, expectedPassword),
  ]);
  return userOk && passwordOk ? expectedUser.trim().toLowerCase() : null;
}

/** Devolve o nome do usuário autenticado, ou null. */
export async function authenticate(user: string, password: string) {
  try {
    return (await checkEnvCredentials(user, password)) ?? (await verifyUser(user, password));
  } catch {
    return null;
  }
}

export async function createSession(username: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(secret(), username), {
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

export async function currentUser() {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
}

export async function isLoggedIn() {
  return (await currentUser()) !== null;
}

/** Para páginas e server actions: garante sessão ou manda para o login. */
export async function requireUser() {
  const username = await currentUser();
  if (!username) redirect("/login");
  return username;
}
