import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      branch: user.branch,
      year: user.year,
      role: user.role,
      recoveryTokens: user.recoveryTokens,
      streak: user.streak,
      badges: user.userBadges.map((ub) => ub.badge),
    },
  });
}
