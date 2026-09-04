import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";
import { MIN_PASSWORD_LENGTH } from "./limits";
import { hashPassword, verifyPassword } from "./password";
import type { AppUser } from "./types";

type UserDoc = {
  _id: ObjectId;
  username: string;
  hash: string;
  salt: string;
  iterations: number;
  createdAt: Date;
};

async function users(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function checkUsername(username: string) {
  if (username.length < 3) return "O usuário precisa de pelo menos 3 caracteres.";
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return "Use apenas letras sem acento, números, ponto, hífen ou underline.";
  }
  return null;
}

export async function listUsers(): Promise<AppUser[]> {
  const col = await users();
  const docs = await col
    .find({}, { projection: { username: 1, createdAt: 1 } })
    .sort({ username: 1 })
    .toArray();
  return docs.map((doc) => ({
    username: doc.username,
    createdAt: doc.createdAt?.toISOString() ?? null,
  }));
}

export async function countUsers() {
  const col = await users();
  return col.countDocuments();
}

export async function createUser(rawUsername: string, password: string) {
  const username = normalizeUsername(rawUsername);
  const problem = checkUsername(username);
  if (problem) return { ok: false as const, error: problem };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false as const,
      error: `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  const col = await users();
  await col.createIndex({ username: 1 }, { unique: true });
  const { hash, salt, iterations } = await hashPassword(password);
  try {
    await col.insertOne({
      _id: new ObjectId(),
      username,
      hash,
      salt,
      iterations,
      createdAt: new Date(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return { ok: false as const, error: "Já existe um usuário com esse nome." };
    }
    throw error;
  }
  return { ok: true as const, username };
}

export async function deleteUser(rawUsername: string) {
  const col = await users();
  await col.deleteOne({ username: normalizeUsername(rawUsername) });
}

export async function changePassword(rawUsername: string, password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false as const,
      error: `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  const col = await users();
  const { hash, salt, iterations } = await hashPassword(password);
  const result = await col.updateOne(
    { username: normalizeUsername(rawUsername) },
    { $set: { hash, salt, iterations } },
  );
  if (result.matchedCount === 0) {
    return { ok: false as const, error: "Usuário não encontrado." };
  }
  return { ok: true as const };
}

/** Devolve o nome canônico do usuário quando a senha confere. */
export async function verifyUser(rawUsername: string, password: string) {
  const username = normalizeUsername(rawUsername);
  if (!username || !password) return null;
  const col = await users();
  const doc = await col.findOne({ username });
  if (!doc) return null;
  const ok = await verifyPassword(password, {
    hash: doc.hash,
    salt: doc.salt,
    iterations: doc.iterations,
  });
  return ok ? doc.username : null;
}
