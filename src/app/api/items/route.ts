import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const itemSchema = z.object({
  type: z.enum(["important_date", "follow_up"]),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  dueAt: z.string().min(1),
  recurringYearly: z.boolean().default(false),
  personId: z.string().nullable().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(
    `select i.*, p.name as person_name from items i
     left join people p on p.id = i.person_id
     where i.user_id = $1 order by i.due_at asc`,
    [user.id],
  );
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = itemSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { rows } = await db.query(
    `insert into items
      (user_id, person_id, type, title, description, due_at, recurring_yearly)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *`,
    [
      user.id,
      parsed.data.personId ?? null,
      parsed.data.type,
      parsed.data.title,
      parsed.data.description ?? null,
      new Date(parsed.data.dueAt),
      parsed.data.recurringYearly,
    ],
  );

  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
