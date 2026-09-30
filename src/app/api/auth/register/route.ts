import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { getEventSettings } from "@/lib/event";
import { SubmissionValidator } from "@/lib/validator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, studentId, branch, year, codingPlatform, platformUsername, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if registration is open
    const settings = await getEventSettings();
    if (!settings.registrationOpen) {
      return NextResponse.json({ error: "Registration is currently closed by administrators." }, { status: 403 });
    }

    // Validate USN format if provided
    if (studentId && studentId.trim()) {
      const yearNum = year ? parseInt(year, 10) : undefined;
      const usnValidation = SubmissionValidator.validateUSN(studentId, yearNum);
      if (!usnValidation.isValid) {
        return NextResponse.json({ error: usnValidation.error }, { status: 400 });
      }
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          studentId ? { studentId: studentId.trim().toUpperCase() } : { email: cleanEmail },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A participant with this email or USN/Student ID already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        studentId: studentId ? studentId.trim().toUpperCase() : null,
        branch: branch || "CSE",
        year: year ? parseInt(year, 10) : 1,
        phone: phone || null,
        codingPlatform: codingPlatform || "LeetCode",
        platformUsername: platformUsername || null,
        role: "PARTICIPANT",
        recoveryTokens: settings.defaultRecoveryTokens || 3,
        streak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
    });

    // Create session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to CODE100! 🚀",
        message: "Your 100-day journey has begun. Solve today's challenge to initiate your streak!",
        type: "GENERAL",
        link: "/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to complete registration." }, { status: 500 });
  }
}
