import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { PeopleManager } from "@/components/people-manager";

export default async function PeoplePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const people = await db.query(
    "select id, name, relationship_label, notes from people where user_id = $1 order by created_at desc",
    [user.id],
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">People</h1>
      <PeopleManager initialPeople={people.rows} />
    </section>
  );
}
