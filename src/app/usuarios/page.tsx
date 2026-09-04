import { requireUser } from "@/lib/auth";
import { listUsers } from "@/lib/users";
import { UserAdmin } from "@/components/user-admin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const username = await requireUser();
  const users = await listUsers();
  return <UserAdmin users={users} currentUser={username} />;
}
