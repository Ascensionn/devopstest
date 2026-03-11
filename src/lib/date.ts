import { differenceInCalendarDays, format } from "date-fns";

export function formatDueLabel(input: string | Date) {
  const date = new Date(input);
  const days = differenceInCalendarDays(date, new Date());

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days > 1) return `in ${days} days`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}

export function formatDate(input: string | Date) {
  return format(new Date(input), "MMM d, yyyy");
}
