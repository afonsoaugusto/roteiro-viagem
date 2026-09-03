import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getTrip, listActions } from "@/lib/queries";
import { TripBoard } from "@/components/trip-board";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isLoggedIn())) redirect("/login");
  const trip = await getTrip("salvador");
  if (!trip) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <p>Roteiro ainda não disponível.</p>
      </main>
    );
  }
  const items = await listActions("salvador");
  return <TripBoard trip={trip} actions={items} />;
}
