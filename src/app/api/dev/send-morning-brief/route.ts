import { NextResponse } from "next/server";
import { buildMorningBrief } from "@/lib/morning-brief";
import { getCurrentUser } from "@/lib/current-user";
import { sendMorningBriefEmail } from "@/lib/email";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brief = await buildMorningBrief(user.id);
  if (!brief) return NextResponse.json({ ok: true, skipped: true });

  await sendMorningBriefEmail({
    to: user.email,
    firstName: user.name || "there",
    today: brief.groups.today,
    comingUp: brief.groups.comingUp,
    overdue: brief.groups.overdue,
  });

  return NextResponse.json({ ok: true });
}
