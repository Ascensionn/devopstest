import { getDashboardData } from "@/lib/dashboard";

export async function buildMorningBrief(userId: string) {
  const groups = await getDashboardData(userId);
  const total = groups.today.length + groups.comingUp.length + groups.overdue.length;
  if (total === 0) return null;

  const summary = [
    `${groups.today.length} due today`,
    `${groups.comingUp.length} coming up`,
    `${groups.overdue.length} overdue`,
  ].join(" • ");

  return { groups, summary };
}
