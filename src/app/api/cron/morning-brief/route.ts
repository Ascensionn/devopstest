import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildMorningBrief } from "@/lib/morning-brief";
import { sendMorningBriefEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if ((process.env.CRON_SECRET || "") && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.query(
    "select * from users where morning_brief_enabled = true order by created_at asc",
  );

  let sent = 0;
  for (const user of users.rows) {
    const brief = await buildMorningBrief(user.id);
    if (!brief) continue;
    await sendMorningBriefEmail({
      to: user.email,
      firstName: user.name || "there",
      today: brief.groups.today,
      comingUp: brief.groups.comingUp,
      overdue: brief.groups.overdue,
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
