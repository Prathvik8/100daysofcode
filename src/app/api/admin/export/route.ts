import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // participants, submissions, leaderboard, completion

    if (type === "participants") {
      const users = await prisma.user.findMany({
        where: { role: "PARTICIPANT" },
        include: { streak: true, _count: { select: { submissions: true } } },
      });

      const rows = [
        ["USN", "Name", "Email", "Branch", "Year", "Platform", "Username", "Current Streak", "Longest Streak", "Submissions", "Status", "Joined At"],
        ...users.map((u) => [
          u.studentId || "N/A",
          `"${u.name.replace(/"/g, '""')}"`,
          u.email,
          u.branch || "N/A",
          u.year || 1,
          u.codingPlatform || "LeetCode",
          u.platformUsername || "N/A",
          u.streak?.currentStreak || 0,
          u.streak?.longestStreak || 0,
          u._count.submissions,
          u.status,
          u.createdAt.toISOString(),
        ]),
      ];

      const csvContent = rows.map((r) => r.join(",")).join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="code100-participants.csv"',
        },
      });
    }

    if (type === "submissions") {
      const submissions = await prisma.submission.findMany({
        include: {
          user: { select: { name: true, email: true, studentId: true } },
          challenge: { select: { dayNumber: true, title: true } },
        },
        orderBy: { submittedAt: "desc" },
      });

      const rows = [
        ["Submission ID", "Day", "Challenge Title", "Student Name", "USN", "Solution URL", "Status", "Points Awarded", "Submitted At"],
        ...submissions.map((s) => [
          s.id,
          s.challenge.dayNumber,
          `"${s.challenge.title.replace(/"/g, '""')}"`,
          `"${s.user.name.replace(/"/g, '""')}"`,
          s.user.studentId || "N/A",
          `"${s.solutionUrl}"`,
          s.status,
          s.pointsAwarded,
          s.submittedAt.toISOString(),
        ]),
      ];

      const csvContent = rows.map((r) => r.join(",")).join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="code100-submissions.csv"',
        },
      });
    }

    // Default export: Leaderboard
    const snapshot = await prisma.leaderboardSnapshot.findMany({
      orderBy: { rank: "asc" },
    });

    const rows = [
      ["Rank", "Name", "Branch", "Year", "Points", "Problems Solved", "Current Streak", "Longest Streak", "Consistency %"],
      ...snapshot.map((s) => [
        s.rank,
        `"${s.name.replace(/"/g, '""')}"`,
        s.branch || "N/A",
        s.year || 1,
        s.points,
        s.solvedCount,
        s.currentStreak,
        s.longestStreak,
        `${s.consistencyScore}%`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="code100-leaderboard.csv"',
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
