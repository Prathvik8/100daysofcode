import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SubmissionValidator } from "@/lib/validator";
import { calculateEventState } from "@/lib/event";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, solutionUrl, platform, code, screenshotUrl } = body;

    if (!challengeId || !solutionUrl) {
      return NextResponse.json({ error: "Challenge and solution URL are required." }, { status: 400 });
    }

    // Verify event has officially started
    const eventState = await calculateEventState();
    if (!eventState.hasStarted) {
      return NextResponse.json(
        { error: "The challenge event has not started yet. Submissions open on Day 1." },
        { status: 403 }
      );
    }

    // Verify challenge exists and is currently active
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    if (challenge.dayNumber > eventState.currentDay || challenge.status === "DRAFT") {
      return NextResponse.json(
        { error: `Day ${challenge.dayNumber} challenge is locked and not yet open for submission.` },
        { status: 403 }
      );
    }

    // Check validation / anti-cheat rules
    const validation = await SubmissionValidator.validateSubmission({
      userId: session.userId,
      challengeId,
      solutionUrl,
      platform: platform || challenge.platform,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errorMessage || "Invalid submission." }, { status: 400 });
    }

    // Check if user already has an active submission for this challenge
    const existing = await prisma.submission.findFirst({
      where: {
        userId: session.userId,
        challengeId,
      },
    });

    if (existing && (existing.status === "APPROVED" || existing.status === "PENDING")) {
      return NextResponse.json(
        { error: "You already have an active or approved submission for this challenge." },
        { status: 409 }
      );
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: session.userId,
        challengeId,
        solutionUrl: solutionUrl.trim(),
        platform: platform || challenge.platform,
        code: code || null,
        screenshotUrl: screenshotUrl || null,
        status: validation.isSuspicious ? "FLAGGED" : "PENDING",
        suspiciousFlag: validation.flagReason || null,
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      message: validation.isSuspicious
        ? "Submission received and flagged for admin verification."
        : "Submission received! An admin will review and award points shortly.",
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Failed to submit solution." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: session.userId },
      include: {
        challenge: {
          select: {
            dayNumber: true,
            title: true,
            topic: true,
            points: true,
            difficulty: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}
