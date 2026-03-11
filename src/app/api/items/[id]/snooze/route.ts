import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const snoozeSchema = z.object({
  option: z.enum(["tomorrow", "next_week"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = snoozeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const snoozedUntil = addDays(new Date(), parsed.data.option === "tomorrow" ? 1 : 7);

  await db.query(
    `update items set snoozed_until = $1, updated_at = now() where id = $2 and user_id = $3`,
    [snoozedUntil, id, user.id],
  );

  return NextResponse.json({ ok: true });
}
