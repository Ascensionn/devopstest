import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const itemUpdateSchema = z.object({
  type: z.enum(["important_date", "follow_up"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dueAt: z.string().optional(),
  recurringYearly: z.boolean().optional(),
  personId: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = itemUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const existing = await db.query("select * from items where id = $1 and user_id = $2", [id, user.id]);
  if (!existing.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = existing.rows[0];
  const { rows } = await db.query(
    `update items set
      type = $1,
      title = $2,
      description = $3,
      due_at = $4,
      recurring_yearly = $5,
      person_id = $6,
      updated_at = now()
     where id = $7 and user_id = $8
     returning *`,
    [
      parsed.data.type ?? item.type,
      parsed.data.title ?? item.title,
      parsed.data.description === undefined ? item.description : parsed.data.description,
      parsed.data.dueAt ? new Date(parsed.data.dueAt) : item.due_at,
      parsed.data.recurringYearly ?? item.recurring_yearly,
      parsed.data.personId === undefined ? item.person_id : parsed.data.personId,
      id,
      user.id,
    ],
  );

  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query("delete from items where id = $1 and user_id = $2", [id, user.id]);
  return NextResponse.json({ ok: true });
}
