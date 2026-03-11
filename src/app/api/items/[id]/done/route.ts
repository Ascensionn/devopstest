import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query(
    `update items set status = 'done', updated_at = now() where id = $1 and user_id = $2`,
    [id, user.id],
  );

  return NextResponse.json({ ok: true });
}
