import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { formatDueLabel } from "@/lib/date";
import { generateDraft } from "@/lib/draft";

const schema = z.object({ tone: z.enum(["warm", "casual", "formal"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const found = await db.query(
    `select i.*, p.name as person_name
     from items i
     left join people p on p.id = i.person_id
     where i.id = $1 and i.user_id = $2 limit 1`,
    [id, user.id],
  );
  const item = found.rows[0];
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const text = await generateDraft({
    title: item.title,
    type: item.type,
    personName: item.person_name,
    dueTiming: formatDueLabel(item.due_at),
    tone: parsed.data.tone,
  });

  await db.query(`insert into drafts (user_id, item_id, tone, text) values ($1, $2, $3, $4)`, [
    user.id,
    id,
    parsed.data.tone,
    text,
  ]);

  return NextResponse.json({ data: { text } });
}
