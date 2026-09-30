import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GamificationEngine } from "@/lib/gamification";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeDay, reason } = body;

    if (!challengeDay || !reason) {
      return NextResponse.json({ error: "Challenge day and reason are required" }, { status: 400 });
    }

    const result = await GamificationEngine.useRecoveryToken(session.userId, challengeDay, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    await GamificationEngine.refreshLeaderboard();

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Recovery token error:", error);
    return NextResponse.json({ error: "Failed to apply recovery token" }, { status: 500 });
  }
}
