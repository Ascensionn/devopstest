import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const settingsSchema = z.object({
  morningBriefEnabled: z.boolean(),
  morningBriefTime: z.string().min(1),
  timezone: z.string().min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: user });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { rows } = await db.query(
    `update users set morning_brief_enabled = $1, morning_brief_time = $2, timezone = $3, updated_at = now()
     where id = $4 returning *`,
    [parsed.data.morningBriefEnabled, parsed.data.morningBriefTime, parsed.data.timezone, user.id],
  );

  return NextResponse.json({ data: rows[0] });
}
