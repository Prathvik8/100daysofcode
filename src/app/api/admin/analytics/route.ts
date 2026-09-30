import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateEventState } from "@/lib/event";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const eventState = await calculateEventState();

    const [
      totalParticipants,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      flaggedSubmissions,
      users,
      challenges,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PARTICIPANT" } }),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.count({ where: { status: "APPROVED" } }),
      prisma.submission.count({ where: { status: "FLAGGED" } }),
      prisma.user.findMany({
        where: { role: "PARTICIPANT" },
        include: { streak: true, submissions: { where: { status: "APPROVED" } } },
      }),
      prisma.challenge.findMany({
        include: { _count: { select: { submissions: true } } },
      }),
    ]);

    // Active streaks
    const activeParticipantsToday = users.filter((u) => (u.streak?.currentStreak || 0) > 0).length;
    const avgStreak =
      users.reduce((acc, u) => acc + (u.streak?.currentStreak || 0), 0) / (totalParticipants || 1);

    // Branch breakdown
    const branchDistribution: Record<string, number> = {};
    for (const u of users) {
      const b = u.branch || "Other";
      branchDistribution[b] = (branchDistribution[b] || 0) + 1;
    }

    // Year breakdown
    const yearDistribution: Record<string, number> = {};
    for (const u of users) {
      const y = `${u.year || 1} Year`;
      yearDistribution[y] = (yearDistribution[y] || 0) + 1;
    }

    // Streak distribution
    const streakBuckets = {
      "0–7 Days": 0,
      "8–30 Days": 0,
      "31–60 Days": 0,
      "61+ Days": 0,
    };
    for (const u of users) {
      const s = u.streak?.currentStreak || 0;
      if (s <= 7) streakBuckets["0–7 Days"]++;
      else if (s <= 30) streakBuckets["8–30 Days"]++;
      else if (s <= 60) streakBuckets["31–60 Days"]++;
      else streakBuckets["61+ Days"]++;
    }

    // Challenge difficulty breakdown
    const difficultyDistribution = {
      Easy: challenges.filter((c) => c.difficulty === "EASY").length,
      Medium: challenges.filter((c) => c.difficulty === "MEDIUM").length,
      Hard: challenges.filter((c) => c.difficulty === "HARD").length,
    };

    return NextResponse.json({
      metrics: {
        totalParticipants,
        activeParticipantsToday,
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        flaggedSubmissions,
        currentDay: eventState.currentDay,
        averageStreak: Math.round(avgStreak * 10) / 10,
        completionRate: Math.round(
          (approvedSubmissions / (totalParticipants * eventState.currentDay || 1)) * 100
        ),
      },
      charts: {
        branchDistribution: Object.entries(branchDistribution).map(([name, count]) => ({
          name,
          count,
        })),
        yearDistribution: Object.entries(yearDistribution).map(([name, count]) => ({
          name,
          count,
        })),
        streakBuckets: Object.entries(streakBuckets).map(([name, count]) => ({
          name,
          count,
        })),
        difficultyDistribution: Object.entries(difficultyDistribution).map(([name, count]) => ({
          name,
          count,
        })),
      },
      eventState,
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
