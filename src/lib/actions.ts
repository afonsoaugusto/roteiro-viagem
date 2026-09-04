"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, createSession, isLoggedIn, isValidCredentials } from "./auth";
import { addAction, deleteAction, toggleAction } from "./queries";

export async function loginAction(formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await isValidCredentials(user, password))) {
    redirect("/login?error=1");
  }
  await createSession();
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function toggleActionState(id: string, done: boolean) {
  if (!(await isLoggedIn())) redirect("/login");
  await toggleAction(id, done);
  revalidatePath("/");
}

export async function addActionForm(formData: FormData) {
  if (!(await isLoggedIn())) redirect("/login");
  const title = String(formData.get("title") ?? "").trim();
  const dayKey = String(formData.get("dayKey") ?? "");
  const dayLabel = String(formData.get("dayLabel") ?? "");
  if (!title || !dayKey) return;
  await addAction({
    tripSlug: "salvador",
    dayKey,
    dayLabel,
    title,
    notes: String(formData.get("notes") ?? ""),
    placeName: String(formData.get("placeName") ?? ""),
    placeUrl: String(formData.get("placeUrl") ?? ""),
    time: String(formData.get("time") ?? ""),
  });
  revalidatePath("/");
}

export async function deleteActionForm(formData: FormData) {
  if (!(await isLoggedIn())) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteAction(id);
  revalidatePath("/");
}
