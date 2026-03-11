import { ensureUser } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) return null;
  return ensureUser(email, session.user?.name);
}
