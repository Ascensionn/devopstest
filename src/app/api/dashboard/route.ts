import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getDashboardData(user.id);
  return NextResponse.json({ data });
}
