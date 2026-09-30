import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";
import { Flame, Trophy, Award, CheckCircle2, AlertTriangle, ExternalLink, ArrowRight, Clock, Shield, Bell, Sparkles } from "lucide-react";
import DashboardStreakClient from "@/components/DashboardStreakClient";
import EventCountdown from "@/components/EventCountdown";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventState = await calculateEventState();
  const currentDay = eventState.currentDay;

  // Fetch today's challenge
  const [todayChallenge, submissions, userBadges, announcements, rankInfo, notifications] = await Promise.all([
    prisma.challenge.findUnique({
      where: { dayNumber: currentDay },
    }),
    prisma.submission.findMany({
      where: { userId: user.id },
      include: { challenge: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
    }),
    prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { publishAt: "desc" }],
      take: 3,
    }),
    prisma.leaderboardSnapshot.findFirst({
      where: { userId: user.id },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED");
  const totalSolved = approvedSubmissions.length;
  const totalPoints = approvedSubmissions.reduce((acc, curr) => acc + curr.pointsAwarded, 0);
  const completionPercentage = Math.round((totalSolved / 100) * 100);

  // Check if today's challenge has already been submitted
  const todaySubmission = submissions.find((s) => s.challenge.dayNumber === currentDay);
  const isTodayCompleted = todaySubmission?.status === "APPROVED";
  const isTodayPending = todaySubmission?.status === "PENDING";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Welcome and Day Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-white">Welcome, {user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {user.branch || "CSE"} • Year {user.year || 3}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Student ID: <span className="font-mono text-zinc-300">{user.studentId || "1GA22CS089"}</span> • Platform: <span className="text-zinc-300 font-semibold">{user.codingPlatform || "LeetCode"}</span> ({user.platformUsername || "coder"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <EventCountdown
            startDate={new Date(eventState.settings.startDate).toISOString()}
            hasStarted={eventState.hasStarted}
            currentDay={currentDay}
          />
          <div className="glass-panel px-5 py-3 rounded-2xl border border-zinc-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-950/40">
              {currentDay}
            </div>
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Challenge Day</p>
              <p className="text-sm font-extrabold text-white">DAY {currentDay} / 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Warning Banner if not completed today */}
      {!isTodayCompleted && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300">🔥 Your streak is at risk!</p>
              <p className="text-xs text-amber-200/80">
                You have not completed Day {currentDay}&apos;s challenge yet. Submit before 11:59 PM to maintain your {user.streak?.currentStreak || 0}-day streak.
              </p>
            </div>
          </div>
          <Link
            href={`/challenge/${currentDay}`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all self-start sm:self-center"
          >
            Solve Day {currentDay} Now
          </Link>
        </div>
      )}

      {/* 5 Main Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Consecutive</span>
          </div>
          <p className="text-3xl font-black text-amber-400">{user.streak?.currentStreak || 0} <span className="text-sm font-medium text-zinc-400">Days</span></p>
          <p className="text-xs text-zinc-400 mt-1 font-medium">🔥 Current Streak</p>
        </div>

        {/* Points */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scored</span>
          </div>
          <p className="text-3xl font-black text-white">{totalPoints}</p>
          <p className="text-xs text-zinc-400 mt-1 font-medium">🏆 Total Points</p>
        </div>

        {/* Problems Solved */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Verified</span>
          </div>
          <p className="text-3xl font-black text-white">{totalSolved} <span className="text-sm font-medium text-zinc-500">/ 100</span></p>
          <p className="text-xs text-zinc-400 mt-1 font-medium">🧠 Problems Solved</p>
        </div>

        {/* Overall Rank */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">College</span>
          </div>
          <p className="text-3xl font-black text-white">#{rankInfo?.rank || 1}</p>
          <p className="text-xs text-zinc-400 mt-1 font-medium">📈 Overall Rank</p>
        </div>

        {/* Completion % */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Progress</span>
          </div>
          <p className="text-3xl font-black text-rose-400">{completionPercentage}%</p>
          <p className="text-xs text-zinc-400 mt-1 font-medium">🎯 Completion Rate</p>
        </div>
      </div>

      {/* Main Grid: Today's Challenge & Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Challenge Card */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-600 text-white">
                DAY {todayChallenge?.dayNumber || currentDay}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                {todayChallenge?.topic || "Sliding Window"}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {todayChallenge?.difficulty || "MEDIUM"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +{todayChallenge?.points || 15} Points
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {todayChallenge?.title || "Longest Substring Without Repeating Characters"}
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {todayChallenge?.description || "Solve the problem using the optimal linear sliding window invariant. Keep track of character indices."}
          </p>

          <div className="flex items-center space-x-4 text-xs text-zinc-400 mb-8 pb-6 border-b border-zinc-800">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Deadline: <strong>11:59 PM (Asia/Kolkata)</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>Platform: <strong>{todayChallenge?.platform || "LeetCode"}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {todayChallenge?.externalUrl && (
              <a
                href={todayChallenge.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-sm flex items-center space-x-2 transition-all"
              >
                <span>Solve Problem</span>
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </a>
            )}

            <Link
              href={`/challenge/${todayChallenge?.dayNumber || currentDay}`}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/40 flex items-center space-x-2 transition-all"
            >
              <span>{isTodayCompleted ? "View Submitted Solution" : isTodayPending ? "Submission Under Review" : "Submit Solution"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Interactive Streak Calendar & Recovery Client */}
        <div className="space-y-6">
          <DashboardStreakClient
            user={user}
            submissions={submissions}
            currentDay={currentDay}
          />
        </div>
      </div>

      {/* Progress Bar & Badges Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">Overall 100-Day Journey Progress</h3>
            <p className="text-zinc-400 text-xs mt-0.5">
              {totalSolved} of 100 official challenges verified and completed
            </p>
          </div>
          <span className="font-mono text-xl font-black text-rose-500">{completionPercentage}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-1000 rounded-full"
            style={{ width: `${Math.max(2, completionPercentage)}%` }}
          />
        </div>

        {/* Badges showcase */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Earned Badges ({userBadges.length})</h4>
            <Link href="/profile" className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
              View All Badges →
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {userBadges.length > 0 ? (
              userBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="glass-panel px-3.5 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center space-x-2.5"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{ub.badge.name}</p>
                    <p className="text-[10px] text-zinc-400">{ub.badge.rarity}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-xs italic">
                Your first badge is waiting! Complete Day 1 to unlock the &ldquo;Challenger&rdquo; badge.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Announcements & Recent Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Announcements */}
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 text-rose-500 mb-2">
            <Bell className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Announcements</h3>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                    {a.type}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {new Date(a.publishAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mb-1">{a.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Recent Submissions</h3>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 4).map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-rose-400">Day {sub.challenge.dayNumber}</span>
                      <span className="text-xs font-bold text-zinc-200 truncate max-w-[180px]">{sub.challenge.title}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">{new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        sub.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : sub.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {sub.status}
                    </span>
                    {sub.status === "APPROVED" && (
                      <p className="text-xs font-bold text-emerald-400 mt-1">+{sub.pointsAwarded} pts</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs italic">
              No submissions yet. Complete today&apos;s challenge to start your journey.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
