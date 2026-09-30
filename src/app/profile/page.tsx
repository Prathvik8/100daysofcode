import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Award, Flame, Trophy, CheckCircle2, Shield, Calendar, BookOpen } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [submissions, userBadges, rankInfo, allBadges] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { challenge: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
    }),
    prisma.leaderboardSnapshot.findFirst({
      where: { userId: user.id },
    }),
    prisma.badge.findMany({
      where: { active: true },
    }),
  ]);

  const approved = submissions.filter((s) => s.status === "APPROVED");
  const totalPoints = approved.reduce((acc, curr) => acc + curr.pointsAwarded, 0);
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Card Header */}
      <div className="glass-panel p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-950 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-rose-950/50">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {user.role}
                </span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                {user.email} • USN: <span className="font-mono text-zinc-300">{user.studentId || "N/A"}</span>
              </p>
              <div className="flex items-center space-x-3 text-xs text-zinc-500 mt-2">
                <span>{user.branch || "CSE"} • Year {user.year || 3}</span>
                <span>•</span>
                <span>Platform: <strong className="text-zinc-400">{user.codingPlatform || "LeetCode"}</strong> ({user.platformUsername || "N/A"})</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">College Rank</p>
            <p className="text-4xl font-black text-white mt-1">#{rankInfo?.rank || 1}</p>
            <p className="text-xs text-amber-400 font-bold mt-1">🔥 {user.streak?.currentStreak || 0}-day streak</p>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Points</p>
          <p className="text-3xl font-black text-rose-400 mt-1">{totalPoints}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Challenges Solved</p>
          <p className="text-3xl font-black text-white mt-1">{approved.length} <span className="text-xs font-normal text-zinc-500">/ 100</span></p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Longest Streak</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{user.streak?.longestStreak || 0}d</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Recovery Tokens</p>
          <p className="text-3xl font-black text-white mt-1">{user.recoveryTokens}</p>
        </div>
      </div>

      {/* Badges Grid (Earned & Locked) */}
      <div className="glass-panel p-8 rounded-3xl border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Badges & Achievements ({userBadges.length} / {allBadges.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isEarned
                    ? "glass-panel border-amber-500/30 bg-amber-500/5"
                    : "bg-zinc-900/40 border-zinc-800/60 opacity-40 grayscale"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isEarned ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-600"}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {badge.rarity}
                  </span>
                </div>
                <h3 className="font-bold text-zinc-100 text-sm mt-2">{badge.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{badge.description}</p>
                <p className="text-[10px] text-zinc-500 mt-3 font-mono">Criteria: {badge.criteria}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
