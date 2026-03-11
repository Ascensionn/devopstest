import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const personSchema = z.object({
  name: z.string().min(1),
  relationshipLabel: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(
    "select * from people where user_id = $1 order by created_at desc",
    [user.id],
  );
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = personSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { rows } = await db.query(
    `insert into people (user_id, name, relationship_label, notes)
     values ($1, $2, $3, $4)
     returning *`,
    [user.id, parsed.data.name, parsed.data.relationshipLabel, parsed.data.notes ?? null],
  );

  return NextResponse.json({ data: rows[0] }, { status: 201 });
}
