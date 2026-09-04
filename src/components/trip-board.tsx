"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { addActionForm, deleteActionForm, toggleActionState } from "@/lib/actions";
import type { Trip, TripAction } from "@/lib/types";

const CATEGORY: Record<TripAction["category"], string> = {
  logistica: "Logística",
  passeio: "Passeio",
  comida: "Comida",
  checklist: "Checklist",
};

export function TripBoard({ trip, actions }: { trip: Trip; actions: TripAction[] }) {
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [day, setDay] = useState(trip.days[0]?.key ?? "antes");
  const [adding, setAdding] = useState(false);

  // Marca o item na hora e deixa o servidor confirmar depois; sem isso o
  // usuário fica esperando o round trip inteiro para ver o check mudar.
  const [items, markDone] = useOptimistic(
    actions,
    (state, { id, done }: { id: string; done: boolean }) =>
      state.map((a) => (a._id === id ? { ...a, done } : a)),
  );
  const [, startTransition] = useTransition();

  const toggle = (item: TripAction) => {
    const id = item._id;
    if (!id) return;
    const done = !item.done;
    startTransition(async () => {
      markDone({ id, done });
      await toggleActionState(trip.slug, id, done);
    });
  };

  const counts = useMemo(() => {
    const done = items.filter((a) => a.done).length;
    return { done, total: items.length };
  }, [items]);

  const visible = items.filter((a) => {
    if (a.dayKey !== day) return false;
    if (filter === "open") return !a.done;
    if (filter === "done") return a.done;
    return true;
  });

  const currentDay = trip.days.find((d) => d.key === day);

  return (
    <main className="mx-auto min-h-dvh max-w-lg pb-28">
      <header className="sticky top-0 z-10 border-b border-[#0f3d3e]/10 bg-[#f4ead8]/90 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/" className="text-xs text-[#0f3d3e]/70 no-underline">
              ← Viagens
            </Link>
            <h1 className="text-3xl leading-tight text-[#0f3d3e]" style={{ fontFamily: "var(--font-display)" }}>
              {trip.title}
            </h1>
            <p className="mt-1 text-sm text-[#163032]/70">{trip.dates}</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0f3d3e]/10">
          <div
            className="h-full rounded-full bg-[#2f6b4f]"
            style={{ width: `${counts.total ? (counts.done / counts.total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-[#163032]/65">
          {counts.done} de {counts.total} feitos
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trip.days.map((d) => {
            const dayActions = items.filter((a) => a.dayKey === d.key);
            const open = dayActions.filter((a) => !a.done).length;
            const selected = day === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setDay(d.key)}
                className={`min-w-[6.5rem] shrink-0 rounded-2xl px-3 py-2 text-left ${
                  selected ? "bg-[#0f3d3e] text-white" : "bg-white/70 text-[#163032]"
                }`}
              >
                <span className="block text-sm font-medium">{d.label}</span>
                <span className={`block text-[11px] ${selected ? "text-white/70" : "text-[#163032]/55"}`}>
                  {open} abertas
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <section className="px-4 pt-4">
        <h2 className="text-lg font-medium text-[#0f3d3e]">{currentDay?.weekday}</h2>
        <p className="text-sm text-[#163032]/70">{currentDay?.focus}</p>

        <div className="mt-3 flex gap-2">
          {(
            [
              ["all", "Tudo"],
              ["open", "Falta"],
              ["done", "Feito"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                filter === id ? "bg-[#c45c3e] text-white" : "bg-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {visible.map((item) => (
            <li
              key={item._id}
              className={`rounded-3xl bg-white/80 p-4 shadow-sm ${item.done ? "opacity-60" : ""}`}
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-pressed={item.done}
                  aria-label={item.done ? "Marcar como pendente" : "Marcar como feito"}
                  onClick={() => toggle(item)}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    item.done
                      ? "border-[#2f6b4f] bg-[#2f6b4f] text-white"
                      : "border-[#0f3d3e]/30 bg-white"
                  }`}
                >
                  {item.done ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`font-medium ${item.done ? "line-through" : ""}`}>{item.title}</p>
                    {item.time ? (
                      <span className="shrink-0 text-xs text-[#0f3d3e]/60">{item.time}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] tracking-wide text-[#0f3d3e]/55 uppercase">
                    {CATEGORY[item.category]}
                  </p>
                  {item.notes ? (
                    <p className="mt-2 text-sm leading-relaxed text-[#163032]/75">{item.notes}</p>
                  ) : null}
                  {item.placeUrl ? (
                    <a
                      href={item.placeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#14575a] px-3 py-1.5 text-sm font-medium text-white no-underline active:bg-[#0f3d3e]"
                    >
                      <span aria-hidden>📍</span>
                      {item.placeName ?? "Abrir local"}
                    </a>
                  ) : item.placeName ? (
                    <p className="mt-2 text-sm">{item.placeName}</p>
                  ) : null}
                  {item.custom && item._id ? (
                    <form action={deleteActionForm} className="mt-3">
                      <input type="hidden" name="id" value={item._id} />
                      <input type="hidden" name="tripSlug" value={trip.slug} />
                      <button type="submit" className="text-sm text-[#a8452c]">
                        Remover
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {visible.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#163032]/60">Nada neste filtro.</p>
        ) : null}
      </section>

      <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full bg-[#0f3d3e] px-5 py-3.5 text-sm font-medium text-white shadow-lg"
        >
          Adicionar ação
        </button>
      </div>

      {adding ? (
        <div className="fixed inset-0 z-20 bg-[#163032]/40 px-4 py-8">
          <form
            action={async (formData) => {
              await addActionForm(formData);
              setAdding(false);
            }}
            className="mx-auto max-h-[90dvh] max-w-lg overflow-y-auto rounded-3xl bg-[#f4ead8] p-5"
          >
            <h3 className="text-xl text-[#0f3d3e]" style={{ fontFamily: "var(--font-display)" }}>
              Nova ação
            </h3>
            <input type="hidden" name="tripSlug" value={trip.slug} />
            <input type="hidden" name="dayKey" value={day} />
            <input type="hidden" name="dayLabel" value={currentDay?.label ?? day} />
            <label className="mt-4 block text-sm">
              Título
              <input
                name="title"
                required
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm">
              Horário (opcional)
              <input
                name="time"
                placeholder="14:00"
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm">
              Notas
              <textarea
                name="notes"
                rows={3}
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm">
              Nome do local
              <input
                name="placeName"
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <label className="mt-3 block text-sm">
              Link do local
              <input
                name="placeUrl"
                type="url"
                placeholder="https://maps.google.com/..."
                className="mt-1 w-full rounded-2xl border border-[#0f3d3e]/15 bg-white px-3 py-3"
              />
            </label>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="flex-1 rounded-2xl bg-white py-3"
              >
                Cancelar
              </button>
              <button type="submit" className="flex-1 rounded-2xl bg-[#0f3d3e] py-3 text-white">
                Salvar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
