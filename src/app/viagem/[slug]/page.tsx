import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTrip, listActions } from "@/lib/queries";
import { TripBoard } from "@/components/trip-board";

export const dynamic = "force-dynamic";

export default async function TripPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;
  const trip = await getTrip(slug);
  // Volta para a lista em vez de 404: se o banco estiver vazio, a lista
  // popula a viagem de exemplo e o link volta a funcionar.
  if (!trip) redirect("/");
  const items = await listActions(slug);
  return <TripBoard trip={trip} actions={items} />;
}
