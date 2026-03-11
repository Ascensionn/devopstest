import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/dashboard";
import { ItemCard } from "@/components/item-card";
import { ItemForm } from "@/components/item-form";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const data = await getDashboardData(user.id);
  const people = await db.query("select id, name from people where user_id = $1 order by name asc", [user.id]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>

      <ItemForm people={people.rows} />

      <Section title="Today" items={data.today} />
      <Section title="Coming Up" items={data.comingUp} />
      <Section title="Overdue" items={data.overdue} overdue />

      {data.today.length + data.comingUp.length + data.overdue.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
          No active reminders right now.
        </p>
      )}
    </section>
  );
}

function Section({
  title,
  items,
  overdue = false,
}: {
  title: string;
  items: Array<{ id: string; title: string; due_at: string; type: "important_date" | "follow_up"; person_name?: string | null }>;
  overdue?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing here.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} overdue={overdue} />
          ))}
        </div>
      )}
    </section>
  );
}
