import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GamificationEngine } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overall"; // overall, streak, branch, year, consistency
    const branch = searchParams.get("branch");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const refresh = searchParams.get("refresh");

    if (refresh === "true") {
      await GamificationEngine.refreshLeaderboard();
    }

    // Check if we need branch aggregate
    if (type === "branch") {
      const users = await prisma.user.findMany({
        where: { role: "PARTICIPANT", status: "ACTIVE" },
        include: {
          submissions: { where: { status: "APPROVED" } },
          scoreTransactions: true,
          streak: true,
        },
      });

      const branchMap: Record<string, { participants: number; totalPoints: number; totalSolved: number; activeStreaks: number }> = {};

      for (const u of users) {
        const b = u.branch || "Other";
        if (!branchMap[b]) {
          branchMap[b] = { participants: 0, totalPoints: 0, totalSolved: 0, activeStreaks: 0 };
        }
        const pts = u.scoreTransactions.reduce((acc, c) => acc + c.points, 0);
        branchMap[b].participants += 1;
        branchMap[b].totalPoints += pts;
        branchMap[b].totalSolved += u.submissions.length;
        if ((u.streak?.currentStreak || 0) > 0) {
          branchMap[b].activeStreaks += 1;
        }
      }

      const branchList = Object.entries(branchMap).map(([name, data]) => ({
        branch: name,
        participants: data.participants,
        totalPoints: data.totalPoints,
        averagePoints: Math.round(data.totalPoints / (data.participants || 1)),
        completionRate: Math.round((data.totalSolved / (data.participants * 100 || 1)) * 100),
        activeParticipants: data.activeStreaks,
      }));

      branchList.sort((a, b) => b.totalPoints - a.totalPoints);
      return NextResponse.json({ type: "branch", data: branchList });
    }

    // Check if we need year aggregate
    if (type === "year") {
      const users = await prisma.user.findMany({
        where: { role: "PARTICIPANT", status: "ACTIVE" },
        include: {
          submissions: { where: { status: "APPROVED" } },
          scoreTransactions: true,
        },
      });

      const yearMap: Record<number, { participants: number; totalPoints: number; totalSolved: number }> = {
        1: { participants: 0, totalPoints: 0, totalSolved: 0 },
        2: { participants: 0, totalPoints: 0, totalSolved: 0 },
        3: { participants: 0, totalPoints: 0, totalSolved: 0 },
        4: { participants: 0, totalPoints: 0, totalSolved: 0 },
      };

      for (const u of users) {
        const y = u.year || 1;
        if (!yearMap[y]) yearMap[y] = { participants: 0, totalPoints: 0, totalSolved: 0 };
        const pts = u.scoreTransactions.reduce((acc, c) => acc + c.points, 0);
        yearMap[y].participants += 1;
        yearMap[y].totalPoints += pts;
        yearMap[y].totalSolved += u.submissions.length;
      }

      const yearList = Object.entries(yearMap).map(([yr, data]) => ({
        year: `${yr}${yr === "1" ? "st" : yr === "2" ? "nd" : yr === "3" ? "rd" : "th"} Year`,
        yearNumber: parseInt(yr, 10),
        participants: data.participants,
        totalPoints: data.totalPoints,
        averagePoints: Math.round(data.totalPoints / (data.participants || 1)),
        completionRate: Math.round((data.totalSolved / (data.participants * 100 || 1)) * 100),
      }));

      yearList.sort((a, b) => b.totalPoints - a.totalPoints);
      return NextResponse.json({ type: "year", data: yearList });
    }

    // Query standard snapshot with filtering
    let whereClause: any = {};
    if (branch && branch !== "ALL") {
      whereClause.branch = branch;
    }
    if (year && year !== "ALL") {
      whereClause.year = parseInt(year, 10);
    }
    if (search) {
      whereClause.name = { contains: search };
    }

    let orderBy: any = [{ rank: "asc" }];
    if (type === "streak") {
      orderBy = [{ currentStreak: "desc" }, { longestStreak: "desc" }, { points: "desc" }];
    } else if (type === "consistency") {
      orderBy = [{ consistencyScore: "desc" }, { points: "desc" }];
    }

    const leaderboard = await prisma.leaderboardSnapshot.findMany({
      where: whereClause,
      orderBy,
      take: 100,
    });

    return NextResponse.json({
      type,
      data: leaderboard,
      totalCount: leaderboard.length,
    });
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
