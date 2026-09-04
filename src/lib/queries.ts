import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";
import { SALVADOR_TRIP, salvadorSeedActions } from "./seed-data";
import { buildTripPeriod, slugify } from "./trip-days";
import type { Trip, TripAction, TripSummary } from "./types";

type ActionDoc = Omit<TripAction, "_id"> & { _id: ObjectId };

async function trips(): Promise<Collection<Trip>> {
  const db = await getDb();
  return db.collection<Trip>("trips");
}

async function actions(): Promise<Collection<ActionDoc>> {
  const db = await getDb();
  return db.collection<ActionDoc>("actions");
}

export async function ensureIndexes() {
  const col = await actions();
  await col.createIndex({ tripSlug: 1, dayKey: 1, sort: 1 });
  await col.createIndex({ seedKey: 1 }, { unique: true, sparse: true });
  const tripCol = await trips();
  await tripCol.createIndex({ slug: 1 }, { unique: true });
}

export async function seedIfEmpty() {
  await ensureIndexes();
  const tripCol = await trips();
  await tripCol.updateOne(
    { slug: SALVADOR_TRIP.slug },
    { $setOnInsert: SALVADOR_TRIP },
    { upsert: true },
  );

  const actionCol = await actions();
  await actionCol.bulkWrite(
    salvadorSeedActions().map(({ seedKey, ...rest }) => ({
      updateOne: {
        filter: { seedKey },
        update: { $setOnInsert: { ...rest, seedKey } },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

function serialize(doc: ActionDoc): TripAction {
  return { ...doc, _id: doc._id.toHexString() };
}

function plainTrip(doc: Trip): Trip {
  return {
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.subtitle,
    dates: doc.dates,
    days: doc.days,
    custom: doc.custom ?? false,
  };
}

/** Lista as viagens com o progresso de cada uma, em duas consultas. */
export async function listTrips(): Promise<TripSummary[]> {
  const tripCol = await trips();
  let docs = await tripCol.find().sort({ _id: 1 }).toArray();
  if (docs.length === 0) {
    await seedIfEmpty();
    docs = await tripCol.find().sort({ _id: 1 }).toArray();
  }

  const actionCol = await actions();
  const progress = await actionCol
    .aggregate<{ _id: string; done: number; total: number }>([
      {
        $group: {
          _id: "$tripSlug",
          total: { $sum: 1 },
          done: { $sum: { $cond: ["$done", 1, 0] } },
        },
      },
    ])
    .toArray();
  const bySlug = new Map(progress.map((row) => [row._id, row]));

  return docs.map((doc) => {
    const counts = bySlug.get(doc.slug);
    return { ...plainTrip(doc), done: counts?.done ?? 0, total: counts?.total ?? 0 };
  });
}

export async function getTrip(slug: string) {
  const tripCol = await trips();
  const trip = await tripCol.findOne({ slug });
  return trip ? plainTrip(trip) : null;
}

export async function listActions(slug: string) {
  const col = await actions();
  const docs = await col.find({ tripSlug: slug }).sort({ dayKey: 1, sort: 1 }).toArray();
  return docs.map(serialize);
}

export async function createTrip(input: {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
}) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "Dê um nome para a viagem." };

  const period = buildTripPeriod(input.startDate, input.endDate);
  if ("error" in period) return { ok: false as const, error: period.error };

  await ensureIndexes();
  const tripCol = await trips();
  const base = slugify(title);
  let slug = base;
  let attempt = 2;
  while (await tripCol.findOne({ slug }, { projection: { _id: 1 } })) {
    slug = `${base}-${attempt}`;
    attempt += 1;
  }

  await tripCol.insertOne({
    slug,
    title,
    subtitle: input.subtitle.trim(),
    dates: period.dates,
    days: period.days,
    custom: true,
  });
  return { ok: true as const, slug };
}

export async function deleteTrip(slug: string) {
  const tripCol = await trips();
  const removed = await tripCol.findOneAndDelete({ slug, custom: true });
  if (!removed) return false;
  const actionCol = await actions();
  await actionCol.deleteMany({ tripSlug: slug });
  return true;
}

export async function toggleAction(id: string, done: boolean) {
  const col = await actions();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { done } });
}

export async function addAction(input: {
  tripSlug: string;
  dayKey: string;
  dayLabel: string;
  title: string;
  notes?: string;
  placeName?: string;
  placeUrl?: string;
  time?: string;
}) {
  const col = await actions();
  const last = await col
    .find({ tripSlug: input.tripSlug, dayKey: input.dayKey })
    .sort({ sort: -1 })
    .limit(1)
    .toArray();
  const sort = (last[0]?.sort ?? 0) + 10;
  const doc: ActionDoc = {
    _id: new ObjectId(),
    tripSlug: input.tripSlug,
    dayKey: input.dayKey,
    dayLabel: input.dayLabel,
    sort,
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    placeName: input.placeName?.trim() || undefined,
    placeUrl: input.placeUrl?.trim() || undefined,
    time: input.time?.trim() || undefined,
    category: "checklist",
    done: false,
    custom: true,
  };
  await col.insertOne(doc);
  return serialize(doc);
}

export async function deleteAction(id: string) {
  const col = await actions();
  await col.deleteOne({ _id: new ObjectId(id), custom: true });
}
