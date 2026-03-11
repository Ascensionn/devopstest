import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const personUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  relationshipLabel: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = personUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const current = await db.query("select * from people where id = $1 and user_id = $2", [id, user.id]);
  if (!current.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const person = current.rows[0];
  const next = {
    name: parsed.data.name ?? person.name,
    relationshipLabel: parsed.data.relationshipLabel ?? person.relationship_label,
    notes: parsed.data.notes === undefined ? person.notes : parsed.data.notes,
  };

  const { rows } = await db.query(
    `update people
       set name = $1, relationship_label = $2, notes = $3, updated_at = now()
     where id = $4 and user_id = $5
     returning *`,
    [next.name, next.relationshipLabel, next.notes, id, user.id],
  );

  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query("delete from people where id = $1 and user_id = $2", [id, user.id]);
  return NextResponse.json({ ok: true });
}
