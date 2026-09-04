"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createTripForm, deleteTripForm, logoutAction } from "@/lib/actions";
import type { TripSummary } from "@/lib/types";

export function TripList({
  trips,
  username,
}: {
  trips: TripSummary[];
  username: string;
}) {
  const [adding, setAdding] = useState(false);
  const [state, submit, pending] = useActionState(createTripForm, {});

  return (
    <main className="mx-auto min-h-dvh max-w-lg pb-28">
      <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#0f3d3e]/60 uppercase">Roteiro</p>
            <h1
              className="text-3xl leading-tight text-[#0f3d3e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Minhas viagens
            </h1>
            <p className="mt-1 text-sm text-[#163032]/70">Conectado como {username}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full px-3 py-2 text-sm text-[#0f3d3e]/70">
              Sair
            </button>
          </form>
        </div>
        <Link
          href="/usuarios"
          className="mt-3 inline-flex rounded-full border border-[#0f3d3e]/20 bg-white/70 px-3 py-1.5 text-sm text-[#0f3d3e] no-underline"
        >
          Usuários
        </Link>
      </header>

      <section className="space-y-3 px-4 pt-4">
        {trips.map((trip) => {
          const percent = trip.total ? (trip.done / trip.total) * 100 : 0;
          return (
            <article key={trip.slug} className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <Link href={`/viagem/${trip.slug}`} className="block no-underline">
                <h2
                  className="text-2xl leading-tight text-[#0f3d3e]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {trip.title}
                </h2>
                {trip.subtitle ? (
                  <p className="mt-1 text-sm text-[#163032]/75">{trip.subtitle}</p>
                ) : null}
                <p className="mt-1 text-sm text-[#0f3d3e]/70">{trip.dates}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0f3d3e]/10">
                  <div
                    className="h-full rounded-full bg-[#2f6b4f]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#163032]/65">
                  {trip.done} de {trip.total} feitos
                </p>
              </Link>
              {trip.custom ? (
                <form
                  action={deleteTripForm}
                  className="mt-3"
                  onSubmit={(event) => {
                    if (!confirm(`Remover a viagem "${trip.title}" e todas as suas ações?`)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="slug" value={trip.slug} />
                  <button type="submit" className="text-sm text-[#a8452c]">
                    Remover viagem
                  </button>
                </form>
              ) : null}
            </article>
          );
        })}

        {trips.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#163032]/60">
            Nenhuma viagem ainda. Crie a primeira.
          </p>
        ) : null}
      </section>

      <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full bg-[#0f3d3e] px-5 py-3.5 text-sm font-medium text-white shadow-lg"
        >
          Nova viagem
        </button>
      </div>

      {adding ? (
        <div className="fixed inset-0 z-20 bg-[#163032]/40 px-4 py-8">
          <form
            action={submit}
            className="mx-auto max-h-[90dvh] max-w-lg overflow-y-auto rounded-3xl bg-[#f4ead8] p-5"
          >
            <h3 className="text-xl text-[#0f3d3e]" style={{ fontFamily: "var(--font-display)" }}>
              Nova viagem
            </h3>
            <p className="mt-1 text-sm text-[#163032]/70">
              Os dias do roteiro são criados a partir do período, e você adiciona as ações depois.
            </p>
            <label className="mt-4 block text-sm">
              Nome
              <input
                name="title"
                required
                placeholder="Salvador"
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm">
              Descrição (opcional)
              <input
                name="subtitle"
                placeholder="Praia calma e Pelourinho"
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <label className="flex-1 text-sm">
                Início
                <input
                  name="startDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
                />
              </label>
              <label className="flex-1 text-sm">
                Fim
                <input
                  name="endDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
                />
              </label>
            </div>
            {state.error ? (
              <p className="mt-3 text-sm text-[#a8452c]">{state.error}</p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="flex-1 rounded-2xl bg-white py-3"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-2xl bg-[#0f3d3e] py-3 text-white disabled:opacity-60"
              >
                {pending ? "Criando..." : "Criar viagem"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
