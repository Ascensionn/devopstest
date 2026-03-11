import { addDays, endOfDay, isBefore, isSameDay, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export type DashboardItem = {
  id: string;
  title: string;
  type: "important_date" | "follow_up";
  due_at: string;
  recurring_yearly: boolean;
  status: "active" | "done";
  snoozed_until: string | null;
  person_name: string | null;
  person_id: string | null;
  description: string | null;
};

function computeEffectiveDueDate(item: DashboardItem, now = new Date()) {
  const due = new Date(item.due_at);
  if (!item.recurring_yearly) return due;

  const currentYear = now.getFullYear();
  const candidate = new Date(due);
  candidate.setFullYear(currentYear);
  if (isBefore(candidate, startOfDay(now))) {
    candidate.setFullYear(currentYear + 1);
  }
  return candidate;
}

export async function getDashboardData(userId: string, now = new Date()) {
  const { rows } = await db.query<DashboardItem>(
    `select i.*, p.name as person_name
     from items i
     left join people p on p.id = i.person_id
     where i.user_id = $1 and i.status = 'active'`,
    [userId],
  );

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const comingUpEnd = endOfDay(addDays(now, 7));

  const visible = rows
    .filter((item: DashboardItem) => {
      if (!item.snoozed_until) return true;
      return new Date(item.snoozed_until) <= now;
    })
    .map((item: DashboardItem) => ({ ...item, effectiveDueAt: computeEffectiveDueDate(item, now) }));

  return {
    today: visible.filter((item: DashboardItem & { effectiveDueAt: Date }) => isSameDay(item.effectiveDueAt, now)),
    comingUp: visible.filter(
      (item: DashboardItem & { effectiveDueAt: Date }) => item.effectiveDueAt > todayEnd && item.effectiveDueAt <= comingUpEnd,
    ),
    overdue: visible.filter((item: DashboardItem & { effectiveDueAt: Date }) => item.effectiveDueAt < todayStart),
  };
}
