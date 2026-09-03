import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";
import { SALVADOR_TRIP, salvadorSeedActions } from "./seed-data";
import type { Trip, TripAction } from "./types";

type ActionDoc = Omit<TripAction, "_id"> & { _id: ObjectId };

async function trips() {
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
  const seed = salvadorSeedActions();
  for (const item of seed) {
    const { seedKey, ...rest } = item;
    await actionCol.updateOne(
      { seedKey },
      { $setOnInsert: { ...rest, seedKey, _id: new ObjectId() } },
      { upsert: true },
    );
  }
}

function serialize(doc: ActionDoc): TripAction {
  return { ...doc, _id: doc._id.toHexString() };
}

export async function getTrip(slug: string) {
  await seedIfEmpty();
  const tripCol = await trips();
  return tripCol.findOne({ slug });
}

export async function listActions(slug: string) {
  await seedIfEmpty();
  const col = await actions();
  const docs = await col.find({ tripSlug: slug }).sort({ dayKey: 1, sort: 1 }).toArray();
  return docs.map(serialize);
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
