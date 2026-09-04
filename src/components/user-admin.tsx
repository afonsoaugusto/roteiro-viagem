"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePasswordForm, createUserForm, deleteUserForm } from "@/lib/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/limits";
import type { AppUser } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export function UserAdmin({
  users,
  currentUser,
}: {
  users: AppUser[];
  currentUser: string;
}) {
  const [createState, createSubmit, creating] = useActionState(createUserForm, {});
  const [passwordState, passwordSubmit, changing] = useActionState(changePasswordForm, {});

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16">
      <Link href="/" className="text-sm text-[#0f3d3e]/70 no-underline">
        ← Viagens
      </Link>
      <h1
        className="mt-2 text-3xl leading-tight text-[#0f3d3e]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Usuários
      </h1>
      <p className="mt-1 text-sm text-[#163032]/70">
        Quem tem login vê e edita todas as viagens.
      </p>

      <section className="mt-6 space-y-2">
        {users.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {user.username}
                {user.username === currentUser ? (
                  <span className="ml-2 text-xs text-[#0f3d3e]/60">você</span>
                ) : null}
              </p>
              {formatDate(user.createdAt) ? (
                <p className="text-xs text-[#163032]/60">criado em {formatDate(user.createdAt)}</p>
              ) : null}
            </div>
            {user.username === currentUser ? null : (
              <form
                action={deleteUserForm}
                onSubmit={(event) => {
                  if (!confirm(`Remover o acesso de ${user.username}?`)) event.preventDefault();
                }}
              >
                <input type="hidden" name="username" value={user.username} />
                <button type="submit" className="shrink-0 text-sm text-[#a8452c]">
                  Remover
                </button>
              </form>
            )}
          </div>
        ))}

        {users.length === 0 ? (
          <p className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-[#163032]/70">
            Nenhum usuário cadastrado no banco ainda. Você entrou pelo acesso definido nas
            variáveis de ambiente, que continua valendo.
          </p>
        ) : null}
      </section>

      <form action={createSubmit} className="mt-8 rounded-3xl bg-white/80 p-5">
        <h2 className="text-xl text-[#0f3d3e]" style={{ fontFamily: "var(--font-display)" }}>
          Novo usuário
        </h2>
        <label className="mt-4 block text-sm">
          Usuário
          <input
            name="username"
            required
            autoComplete="off"
            autoCapitalize="none"
            placeholder="maria"
            className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
          />
        </label>
        <label className="mt-3 block text-sm">
          Senha
          <input
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
          />
        </label>
        <p className="mt-1 text-xs text-[#163032]/60">
          Mínimo de {MIN_PASSWORD_LENGTH} caracteres.
        </p>
        {createState.error ? (
          <p className="mt-3 text-sm text-[#a8452c]">{createState.error}</p>
        ) : null}
        {createState.ok ? (
          <p className="mt-3 text-sm text-[#2f6b4f]">{createState.ok}</p>
        ) : null}
        <button
          type="submit"
          disabled={creating}
          className="mt-4 w-full rounded-2xl bg-[#0f3d3e] py-3 text-white disabled:opacity-60"
        >
          {creating ? "Criando..." : "Criar usuário"}
        </button>
      </form>

      {users.length > 0 ? (
        <form action={passwordSubmit} className="mt-4 rounded-3xl bg-white/80 p-5">
          <h2 className="text-xl text-[#0f3d3e]" style={{ fontFamily: "var(--font-display)" }}>
            Trocar senha
          </h2>
          <label className="mt-4 block text-sm">
            Usuário
            <select
              name="username"
              required
              defaultValue={users.some((u) => u.username === currentUser) ? currentUser : ""}
              className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
            >
              <option value="" disabled>
                Escolha
              </option>
              {users.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm">
            Nova senha
            <input
              name="password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
            />
          </label>
          {passwordState.error ? (
            <p className="mt-3 text-sm text-[#a8452c]">{passwordState.error}</p>
          ) : null}
          {passwordState.ok ? (
            <p className="mt-3 text-sm text-[#2f6b4f]">{passwordState.ok}</p>
          ) : null}
          <button
            type="submit"
            disabled={changing}
            className="mt-4 w-full rounded-2xl bg-white py-3 text-[#0f3d3e] ring-1 ring-[#0f3d3e]/20 disabled:opacity-60"
          >
            {changing ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      ) : null}
    </main>
  );
}
