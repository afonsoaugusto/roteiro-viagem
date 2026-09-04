"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticate, clearSession, createSession, requireUser } from "./auth";
import {
  addAction,
  createTrip,
  deleteAction,
  deleteTrip,
  toggleAction,
} from "./queries";
import { changePassword, createUser, deleteUser, normalizeUsername } from "./users";

export type FormResult = { error?: string; ok?: string };

function text(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function loginAction(formData: FormData) {
  const username = await authenticate(text(formData, "user"), String(formData.get("password") ?? ""));
  if (!username) redirect("/login?error=1");
  await createSession(username);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function toggleActionState(tripSlug: string, id: string, done: boolean) {
  await requireUser();
  await toggleAction(id, done);
  revalidatePath(`/viagem/${tripSlug}`);
  revalidatePath("/");
}

export async function addActionForm(formData: FormData) {
  await requireUser();
  const tripSlug = text(formData, "tripSlug");
  const title = text(formData, "title");
  const dayKey = text(formData, "dayKey");
  if (!tripSlug || !title || !dayKey) return;
  await addAction({
    tripSlug,
    dayKey,
    dayLabel: text(formData, "dayLabel"),
    title,
    notes: text(formData, "notes"),
    placeName: text(formData, "placeName"),
    placeUrl: text(formData, "placeUrl"),
    time: text(formData, "time"),
  });
  revalidatePath(`/viagem/${tripSlug}`);
  revalidatePath("/");
}

export async function deleteActionForm(formData: FormData) {
  await requireUser();
  const id = text(formData, "id");
  const tripSlug = text(formData, "tripSlug");
  if (!id) return;
  await deleteAction(id);
  revalidatePath(`/viagem/${tripSlug}`);
  revalidatePath("/");
}

export async function createTripForm(
  _previous: FormResult,
  formData: FormData,
): Promise<FormResult> {
  await requireUser();
  const result = await createTrip({
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    startDate: text(formData, "startDate"),
    endDate: text(formData, "endDate"),
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/");
  redirect(`/viagem/${result.slug}`);
}

export async function deleteTripForm(formData: FormData) {
  await requireUser();
  const slug = text(formData, "slug");
  if (!slug) return;
  await deleteTrip(slug);
  revalidatePath("/");
  redirect("/");
}

export async function createUserForm(
  _previous: FormResult,
  formData: FormData,
): Promise<FormResult> {
  await requireUser();
  const result = await createUser(
    text(formData, "username"),
    String(formData.get("password") ?? ""),
  );
  if (!result.ok) return { error: result.error };
  revalidatePath("/usuarios");
  return { ok: `Usuário ${result.username} criado.` };
}

export async function changePasswordForm(
  _previous: FormResult,
  formData: FormData,
): Promise<FormResult> {
  await requireUser();
  const username = text(formData, "username");
  const result = await changePassword(username, String(formData.get("password") ?? ""));
  if (!result.ok) return { error: result.error };
  return { ok: `Senha de ${normalizeUsername(username)} atualizada.` };
}

export async function deleteUserForm(formData: FormData) {
  const current = await requireUser();
  const username = normalizeUsername(text(formData, "username"));
  if (!username || username === current) return;
  await deleteUser(username);
  revalidatePath("/usuarios");
}
