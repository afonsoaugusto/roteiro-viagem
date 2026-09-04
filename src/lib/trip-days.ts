import { MAX_TRIP_DAYS } from "./limits";
import type { TripDay } from "./types";

// Tabelas fixas em vez de Intl: os rótulos ficam iguais aos da viagem de
// exemplo e não mudam conforme a versão do ICU do runtime.
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Interpreta "2026-11-05" em UTC, para o dia não escorregar por fuso. */
function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return `${String(date.getUTCDate()).padStart(2, "0")}/${MONTHS[date.getUTCMonth()]}`;
}

export type TripPeriod = {
  days: TripDay[];
  dates: string;
};

export function buildTripPeriod(start: string, end: string): TripPeriod | { error: string } {
  const from = parseDate(start);
  const to = parseDate(end);
  if (!from || !to) return { error: "Informe as datas de início e de fim." };
  if (to < from) return { error: "A data de fim precisa ser igual ou depois do início." };

  const nights = Math.round((to.getTime() - from.getTime()) / DAY_MS);
  if (nights + 1 > MAX_TRIP_DAYS) {
    return { error: `A viagem pode ter no máximo ${MAX_TRIP_DAYS} dias.` };
  }

  const days: TripDay[] = [];
  for (let i = 0; i <= nights; i += 1) {
    const date = new Date(from.getTime() + i * DAY_MS);
    days.push({
      key: isoKey(date),
      label: dayLabel(date),
      weekday: WEEKDAYS[date.getUTCDay()],
      focus: "",
    });
  }
  days.push({ key: "antes", label: "Antes", weekday: "Preparação", focus: "Confirmar e empacotar" });

  const period = `${dayLabel(from).replace("/", " ")} — ${dayLabel(to).replace("/", " ")} ${to.getUTCFullYear()}`;
  const suffix = nights === 0 ? "" : ` · ${nights} ${nights === 1 ? "noite" : "noites"}`;
  return { days, dates: `${period}${suffix}` };
}

export function slugify(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "viagem";
}
