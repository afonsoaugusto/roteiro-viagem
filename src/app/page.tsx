import { requireUser } from "@/lib/auth";
import { listTrips } from "@/lib/queries";
import { TripList } from "@/components/trip-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const username = await requireUser();
  const trips = await listTrips();
  return <TripList trips={trips} username={username} />;
}
