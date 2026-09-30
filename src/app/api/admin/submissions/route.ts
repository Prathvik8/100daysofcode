import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GamificationEngine } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            branch: true,
            year: true,
          },
        },
        challenge: {
          select: {
            dayNumber: true,
            title: true,
            points: true,
            difficulty: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error("Admin submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, status, pointsAwarded, adminNotes } = body;

    if (!submissionId || !status) {
      return NextResponse.json({ error: "Submission ID and status required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { challenge: true, user: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const pts = pointsAwarded !== undefined ? pointsAwarded : submission.challenge.points;

    // Update submission
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        pointsAwarded: status === "APPROVED" ? pts : 0,
        reviewedBy: session.name,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
    });

    // If approved, trigger streak and points engine
    if (status === "APPROVED") {
      await GamificationEngine.awardPoints(
        submission.userId,
        pts,
        `Day ${submission.challenge.dayNumber}: ${submission.challenge.title} (${submission.challenge.difficulty})`,
        submission.challengeId
      );

      await GamificationEngine.updateStreakOnApproval(
        submission.userId,
        submission.challenge.dayNumber
      );

      // In-app notification
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          title: "✅ Submission Approved!",
          message: `Your Day ${submission.challenge.dayNumber} solution was approved. +${pts} points awarded!`,
          type: "SUBMISSION_APPROVED",
          link: "/dashboard",
        },
      });
    } else if (status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          title: "❌ Submission Rejected",
          message: `Your Day ${submission.challenge.dayNumber} submission was rejected: ${adminNotes || "Verification failed"}.`,
          type: "SUBMISSION_REJECTED",
          link: `/challenge/${submission.challenge.dayNumber}`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: `SUBMISSION_${status}`,
        targetType: "Submission",
        targetId: submission.id,
        oldValue: submission.status,
        newValue: status,
      },
    });

    // Refresh leaderboard in background
    await GamificationEngine.refreshLeaderboard();

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error("Admin update submission error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
