import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanData() {
  console.log("Cleaning test data (retaining Super Admin, Admin, and 1 demo student)...");

  // Keep these 3 core accounts
  const superAdminEmail = "superadmin@gat.ac.in";
  const adminEmail = "admin@gat.ac.in";
  const studentEmail = "student@gat.ac.in";

  const preservedEmails = [superAdminEmail, adminEmail, studentEmail];

  // 1. Delete all other users and their cascaded relations
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: { notIn: preservedEmails },
    },
  });
  console.log(`✓ Removed ${deletedUsers.count} extra test participant accounts.`);

  // 2. Clear old mock submissions and score transactions for the preserved student so they start fresh
  const demoStudent = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (demoStudent) {
    await prisma.submission.deleteMany({ where: { userId: demoStudent.id } });
    await prisma.scoreTransaction.deleteMany({ where: { userId: demoStudent.id } });
    await prisma.userBadge.deleteMany({ where: { userId: demoStudent.id } });
    await prisma.recoveryTokenLog.deleteMany({ where: { userId: demoStudent.id } });

    // Reset student streak and tokens to initial pristine state
    await prisma.streak.upsert({
      where: { userId: demoStudent.id },
      create: {
        userId: demoStudent.id,
        currentStreak: 0,
        longestStreak: 0,
      },
      update: {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      },
    });

    await prisma.user.update({
      where: { id: demoStudent.id },
      data: { recoveryTokens: 3 },
    });
  }

  // 3. Clear simulated leaderboard snapshots
  await prisma.leaderboardSnapshot.deleteMany({});

  // Populate clean initial snapshot with the demo student
  if (demoStudent) {
    await prisma.leaderboardSnapshot.create({
      data: {
        userId: demoStudent.id,
        name: demoStudent.name,
        branch: demoStudent.branch,
        year: demoStudent.year,
        points: 0,
        solvedCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        consistencyScore: 0,
        rank: 1,
      },
    });
  }

  // 4. Reset Event to Day 1
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end100 = new Date(today.getTime() + 100 * 24 * 60 * 60 * 1000);

  await prisma.eventSetting.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      eventName: "CODE100 — 100 Days of DSA",
      eventTagline: "100 Days. 100 Problems. One Streak.",
      organizationName: "GAT ACM Student Chapter",
      startDate: today,
      endDate: end100,
      currentDayOverride: 1, // Start on Day 1
      registrationOpen: true,
      allowedEmailDomains: "*",
      easyPoints: 10,
      mediumPoints: 15,
      hardPoints: 20,
      defaultRecoveryTokens: 3,
      certificateThresholdProblems: 80,
    },
    update: {
      startDate: today,
      endDate: end100,
      currentDayOverride: 1,
      allowedEmailDomains: "*",
    },
  });

  // Re-align all 100 challenges to start today (Day 1 = Active, Day 2-100 = Scheduled)
  const challenges = await prisma.challenge.findMany({ orderBy: { dayNumber: "asc" } });
  for (const c of challenges) {
    const cStart = new Date(today.getTime() + (c.dayNumber - 1) * 24 * 60 * 60 * 1000);
    const cDeadline = new Date(cStart.getTime() + 24 * 60 * 60 * 1000 - 1000);

    await prisma.challenge.update({
      where: { id: c.id },
      data: {
        startDate: cStart,
        deadline: cDeadline,
        status: c.dayNumber === 1 ? "ACTIVE" : "SCHEDULED",
      },
    });
  }

  console.log("✓ Cleared all test data, mock submissions, and test participants.");
  console.log("✓ Retained accounts:");
  console.log("  1. Super Admin: superadmin@gat.ac.in (acm@gat2026)");
  console.log("  2. Admin:       admin@gat.ac.in (acm@gat2026)");
  console.log("  3. Student:     student@gat.ac.in (acm@gat2026)");
  console.log("✓ Re-aligned challenge progression to Day 1.");
}

cleanData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
