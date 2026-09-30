import { prisma } from "./prisma";

export class GamificationEngine {
  /**
   * Evaluates and updates a user's streak upon approving a challenge submission
   */
  static async updateStreakOnApproval(userId: string, challengeDay: number): Promise<{ currentStreak: number; longestStreak: number }> {
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
    let newCurrent = streak.currentStreak;

    if (!lastDate) {
      newCurrent = 1;
    } else {
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already completed something today, maintain current streak
        newCurrent = streak.currentStreak;
      } else if (diffDays === 1) {
        // Consecutive day
        newCurrent = streak.currentStreak + 1;
      } else {
        // Broke streak (unless recovered), reset to 1
        newCurrent = 1;
      }
    }

    const newLongest = Math.max(streak.longestStreak, newCurrent);

    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastCompletedDate: new Date(),
      },
    });

    // Check streak-related badges
    await this.evaluateBadges(userId, { streak: newCurrent });

    return { currentStreak: newCurrent, longestStreak: newLongest };
  }

  /**
   * Recovers a broken streak using a recovery token
   */
  static async useRecoveryToken(userId: string, challengeDay: number, reason: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { streak: true },
    });

    if (!user) return { success: false, message: "User not found" };
    if (user.recoveryTokens <= 0) {
      return { success: false, message: "You have no remaining recovery tokens." };
    }

    // Decrement recovery token and log
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { recoveryTokens: { decrement: 1 } },
      }),
      prisma.recoveryTokenLog.create({
        data: {
          userId,
          challengeDay,
          reason,
        },
      }),
      prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: (user.streak?.currentStreak || 0) + 1,
          longestStreak: Math.max(user.streak?.longestStreak || 0, (user.streak?.currentStreak || 0) + 1),
          lastCompletedDate: new Date(),
        },
      }),
    ]);

    // Check comeback badge
    const comebackBadge = await prisma.badge.findUnique({ where: { slug: "comeback-kid" } });
    if (comebackBadge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: comebackBadge.id } },
        create: { userId, badgeId: comebackBadge.id },
        update: {},
      });
    }

    return { success: true, message: "Streak restored successfully using 1 recovery token." };
  }

  /**
   * Award points to user and log transaction
   */
  static async awardPoints(userId: string, points: number, reason: string, challengeId?: string) {
    return await prisma.scoreTransaction.create({
      data: {
        userId,
        points,
        reason,
        challengeId,
      },
    });
  }

  /**
   * Evaluates badges eligible for the participant
   */
  static async evaluateBadges(userId: string, triggerContext: { streak?: number; solvedCount?: number; hardCount?: number } = {}) {
    // Fetch user progress
    const [approvedSubmissions, userStreak, existingBadges] = await Promise.all([
      prisma.submission.findMany({
        where: { userId, status: "APPROVED" },
        include: { challenge: true },
      }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.userBadge.findMany({ where: { userId } }),
    ]);

    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
    const allBadges = await prisma.badge.findMany({ where: { active: true } });

    const totalSolved = approvedSubmissions.length;
    const currentStreak = userStreak?.currentStreak || triggerContext.streak || 0;
    const hardSolved = approvedSubmissions.filter((s) => s.challenge.difficulty === "HARD").length;

    const badgesToAward: string[] = [];

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      let eligible = false;
      switch (badge.slug) {
        case "challenger":
          if (totalSolved >= 1) eligible = true;
          break;
        case "7-day-streak":
          if (currentStreak >= 7) eligible = true;
          break;
        case "14-day-streak":
          if (currentStreak >= 14) eligible = true;
          break;
        case "30-day-streak":
          if (currentStreak >= 30) eligible = true;
          break;
        case "50-day-streak":
          if (currentStreak >= 50) eligible = true;
          break;
        case "75-day-streak":
          if (currentStreak >= 75) eligible = true;
          break;
        case "100-day-warrior":
          if (totalSolved >= 100) eligible = true;
          break;
        case "problem-solver":
          if (totalSolved >= 25) eligible = true;
          break;
        case "hard-coder":
          if (hardSolved >= 10) eligible = true;
          break;
      }

      if (eligible) {
        badgesToAward.push(badge.id);
      }
    }

    if (badgesToAward.length > 0) {
      for (const badgeId of badgesToAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId,
          },
        });

        const badgeDetails = allBadges.find((b) => b.id === badgeId);
        if (badgeDetails) {
          await prisma.notification.create({
            data: {
              userId,
              title: "🏆 Badge Unlocked!",
              message: `You earned the "${badgeDetails.name}" badge: ${badgeDetails.description}`,
              type: "BADGE_EARNED",
              link: "/profile",
            },
          });
        }
      }
    }
  }

  /**
   * Recalculates and caches the full leaderboard rankings
   */
  static async refreshLeaderboard() {
    const users = await prisma.user.findMany({
      where: { role: "PARTICIPANT", status: "ACTIVE" },
      include: {
        submissions: { where: { status: "APPROVED" }, orderBy: { submittedAt: "desc" } },
        streak: true,
        scoreTransactions: true,
      },
    });

    // Calculate score, count, streaks
    const participantsWithStats = users.map((user) => {
      const points = user.scoreTransactions.reduce((acc, curr) => acc + curr.points, 0);
      const solvedCount = user.submissions.length;
      const currentStreak = user.streak?.currentStreak || 0;
      const longestStreak = user.streak?.longestStreak || 0;
      const lastSubmissionAt = user.submissions[0]?.submittedAt || user.createdAt;
      const consistencyScore = Math.min(100, Math.round((solvedCount / 100) * 100));

      return {
        userId: user.id,
        name: user.name,
        branch: user.branch,
        year: user.year,
        points,
        solvedCount,
        currentStreak,
        longestStreak,
        consistencyScore,
        lastSubmissionAt,
      };
    });

    // Tie-breaker rules:
    // 1. Total points DESC
    // 2. Completed official challenges DESC
    // 3. Current streak DESC
    // 4. Longest streak DESC
    // 5. Earlier achievement timestamp ASC
    participantsWithStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
      if (b.longestStreak !== a.longestStreak) return b.longestStreak - a.longestStreak;
      return new Date(a.lastSubmissionAt).getTime() - new Date(b.lastSubmissionAt).getTime();
    });

    // Wipe and regenerate snapshot atomically
    await prisma.leaderboardSnapshot.deleteMany({});

    let rank = 1;
    const entries = participantsWithStats.map((p) => {
      return {
        userId: p.userId,
        name: p.name,
        branch: p.branch,
        year: p.year,
        points: p.points,
        solvedCount: p.solvedCount,
        currentStreak: p.currentStreak,
        longestStreak: p.longestStreak,
        consistencyScore: p.consistencyScore,
        lastSubmissionAt: p.lastSubmissionAt,
        rank: rank++,
        previousRank: null,
      };
    });

    if (entries.length > 0) {
      await prisma.leaderboardSnapshot.createMany({
        data: entries,
      });
    }

    return entries;
  }
}
