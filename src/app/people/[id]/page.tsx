import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { ItemCard } from "@/components/item-card";
import { ItemForm } from "@/components/item-form";

type PersonItem = {
  id: string;
  title: string;
  due_at: string;
  type: "important_date" | "follow_up";
  person_name: string | null;
};

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const { id } = await params;

  const personResult = await db.query("select * from people where id = $1 and user_id = $2", [id, user.id]);
  const person = personResult.rows[0];
  if (!person) notFound();

  const people = await db.query("select id, name from people where user_id = $1 order by name asc", [user.id]);

  const items = await db.query<PersonItem>(
    `select i.*, p.name as person_name from items i
     left join people p on p.id = i.person_id
     where i.user_id = $1 and i.person_id = $2 and i.status = 'active' order by i.due_at asc`,
    [user.id, id],
  );

  const now = new Date();
  const overdue: PersonItem[] = items.rows.filter((item: PersonItem) => new Date(item.due_at) < now);
  const upcoming: PersonItem[] = items.rows.filter((item: PersonItem) => new Date(item.due_at) >= now);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">{person.name}</h1>
        <p className="text-sm text-zinc-600">{person.relationship_label}</p>
        {person.notes && <p className="mt-2 text-sm text-zinc-700">{person.notes}</p>}
      </header>

      <ItemForm people={people.rows} personId={id} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-500">No upcoming items.</p>
        ) : (
          upcoming.map((item: PersonItem) => <ItemCard key={item.id} item={item} />)
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Overdue</h2>
        {overdue.length === 0 ? (
          <p className="text-sm text-zinc-500">No overdue items.</p>
        ) : (
          overdue.map((item: PersonItem) => <ItemCard key={item.id} item={item} overdue />)
        )}
      </div>
    </section>
  );
}
