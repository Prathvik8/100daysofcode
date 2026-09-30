import Link from "next/link";
import { Terminal, Flame, Trophy, Award, ArrowRight, ShieldCheck, CheckCircle2, Users, Code, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";
import EventCountdown from "@/components/EventCountdown";

export default async function HomePage() {
  const eventState = await calculateEventState();

  const [totalParticipants, totalSolved, topParticipants] = await Promise.all([
    prisma.user.count({ where: { role: "PARTICIPANT" } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    prisma.leaderboardSnapshot.findMany({
      orderBy: { rank: "asc" },
      take: 10,
    }),
  ]);

  const ROADMAP = [
    { range: "Days 1–15", title: "Arrays & Strings", desc: "Two Sum, Kadane's, Sliding Window basics, Anagrams" },
    { range: "Days 16–30", title: "Searching, Sorting & Hashing", desc: "Binary Search, Koko Eating, Dutch Flag, Intervals" },
    { range: "Days 31–45", title: "Two Pointer & Sliding Window", desc: "Trapping Rain Water, Min Window Substring" },
    { range: "Days 46–60", title: "Linked Lists, Stack & Queue", desc: "Cycle detection, LRU prep, Histogram rectangles" },
    { range: "Days 61–75", title: "Trees, BST & Heaps", desc: "LCA, Tree traversals, Kth element, Serializers" },
    { range: "Days 76–90", title: "Graphs, Greedy & DP", desc: "Number of Islands, Rotting Oranges, Coin Change" },
    { range: "Days 91–100", title: "Mixed Mastery & Final Sprint", desc: "N-Queens, Trie, Word Search II, Alien Dictionary" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-zinc-800/60">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-rose-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>GAT ACM Student Chapter Presents</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-none">
            CODE<span className="text-rose-500">100</span>
            <span className="block text-2xl sm:text-4xl md:text-5xl font-extrabold text-zinc-300 mt-3 font-mono">
              100 DAYS OF DSA
            </span>
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-zinc-300 font-light max-w-2xl mx-auto italic">
            &ldquo;100 Days. 100 Problems. One Streak.&rdquo;
          </p>

          <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The premier college-wide gamified Data Structures & Algorithms consistency challenge. Build lifelong problem-solving habits, maintain your streak, earn badges, and conquer competitive coding.
          </p>

          {/* Live Event / Deadline Timer */}
          <div className="mt-6 flex justify-center">
            <EventCountdown
              startDate={new Date(eventState.settings.startDate).toISOString()}
              hasStarted={eventState.hasStarted}
              currentDay={eventState.currentDay}
            />
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all flex items-center space-x-2"
            >
              <span>Join the Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold text-base transition-all flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Leaderboard</span>
            </Link>
            <Link
              href="/challenges"
              className="px-6 py-3.5 rounded-xl text-zinc-400 hover:text-zinc-200 font-medium text-base transition-colors"
            >
              Explore Curriculum
            </Link>
          </div>

          {/* Live Challenge Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2 text-rose-500">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-white">{totalParticipants || 21}</p>
              <p className="text-xs uppercase font-medium text-zinc-400 mt-1 tracking-wider">Registered Coders</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-white">{totalSolved || 384}</p>
              <p className="text-xs uppercase font-medium text-zinc-400 mt-1 tracking-wider">Problems Solved</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-amber-400">Day {eventState.currentDay}</p>
              <p className="text-xs uppercase font-medium text-zinc-400 mt-1 tracking-wider">Current Day / 100</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2 text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-white">{eventState.daysRemaining}</p>
              <p className="text-xs uppercase font-medium text-zinc-400 mt-1 tracking-wider">Days Remaining</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#080d17]/50 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">Workflow</h2>
            <p className="text-3xl font-black text-white sm:text-4xl">How CODE100 Works</p>
            <p className="text-zinc-400 mt-3 text-sm">Six simple steps to master algorithmic problem-solving.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Register", desc: "Sign up with your college email, USN, branch, and LeetCode handle." },
              { step: "02", title: "Solve Daily Problem", desc: "Unlock one handpicked DSA problem every morning at midnight." },
              { step: "03", title: "Submit Solution", desc: "Submit your accepted LeetCode / platform URL as proof before 11:59 PM." },
              { step: "04", title: "Earn Points", desc: "Gain 10, 15, or 20 points based on problem difficulty (Easy, Medium, Hard)." },
              { step: "05", title: "Maintain Streak", desc: "Keep your daily flame burning. Miss a day? Use 1 of 3 recovery tokens." },
              { step: "06", title: "Climb Leaderboard", desc: "Compete for #1 College Rank, Branch Rank, Year Rank, and Badges." },
            ].map((item) => (
              <div key={item.step} className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
                <span className="text-4xl font-black text-zinc-800 group-hover:text-rose-500/20 transition-colors font-mono absolute top-4 right-4">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 100-Day DSA Roadmap */}
      <section className="py-20 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">Curriculum</h2>
              <p className="text-3xl font-black text-white sm:text-4xl">100-Day DSA Progression</p>
              <p className="text-zinc-400 mt-2 text-sm">Engineered by ACM mentors to build intuition step-by-step.</p>
            </div>
            <Link
              href="/challenges"
              className="mt-4 md:mt-0 text-sm font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <span>View all 100 problems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROADMAP.map((r, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-600">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">{r.range}</span>
                <h3 className="text-lg font-bold text-zinc-100 mt-1 mb-2">{r.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-[#080d17]/50 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Top Performers</h2>
              <p className="text-3xl font-black text-white sm:text-4xl">Leaderboard Preview</p>
              <p className="text-zinc-400 mt-2 text-sm">Live rankings based on verified scores, streaks, and timestamps.</p>
            </div>
            <Link
              href="/leaderboard"
              className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all flex items-center space-x-2"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/70 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Branch & Year</th>
                  <th className="py-4 px-6 text-right">Points</th>
                  <th className="py-4 px-6 text-right">Solved</th>
                  <th className="py-4 px-6 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {topParticipants.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold">
                      {p.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs">
                          🥇 1
                        </span>
                      ) : p.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-400/20 text-zinc-300 border border-zinc-400/40 text-xs">
                          🥈 2
                        </span>
                      ) : p.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 text-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="text-zinc-400 ml-2">#{p.rank}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-200">
                      {p.name}
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-xs">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono">
                        {p.branch || "CSE"} • Yr {p.year || 3}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-rose-400">
                      {p.points}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-300">
                      {p.solvedCount} / 100
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-amber-400">
                      🔥 {p.currentStreak}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rules Summary */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">Code of Conduct</h2>
            <p className="text-3xl font-black text-white sm:text-4xl mb-6">Challenge Rules & Integrity</p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Every participant receives 1 official DSA challenge per day. Submissions must be legitimate solution links on LeetCode/CodeChef. Automated duplicate and suspicious platform checks are enforced.
            </p>
            <Link
              href="/rules"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>View Complete Rules & Tie-Breakers</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
