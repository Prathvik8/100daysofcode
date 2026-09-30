import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";
import { getCurrentUser } from "@/lib/auth";
import { Terminal, CheckCircle2, Lock, ArrowRight, ExternalLink } from "lucide-react";

export default async function ChallengesListPage() {
  const user = await getCurrentUser();
  const eventState = await calculateEventState();
  const currentDay = eventState.currentDay;

  const [challenges, userSubmissions] = await Promise.all([
    prisma.challenge.findMany({
      orderBy: { dayNumber: "asc" },
    }),
    user
      ? prisma.submission.findMany({
          where: { userId: user.id },
        })
      : Promise.resolve([]),
  ]);

  const solvedSet = new Set(
    userSubmissions
      .filter((s) => s.status === "APPROVED")
      .map((s) => s.challengeId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Curriculum</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">100 Days of DSA Challenges</h1>
        <p className="text-zinc-400 text-sm mt-1">
          A comprehensive 100-day progression curated by GAT ACM Student Chapter. Today is <strong className="text-amber-400">Day {currentDay}</strong>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-4 px-6">Day</th>
              <th className="py-4 px-6">Problem</th>
              <th className="py-4 px-6">Topic</th>
              <th className="py-4 px-6">Difficulty</th>
              <th className="py-4 px-6 text-right">Points</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {challenges.map((c) => {
              const isPastOrToday = c.dayNumber <= currentDay;
              const isSolved = solvedSet.has(c.id);

              return (
                <tr
                  key={c.id}
                  className={`hover:bg-zinc-800/20 transition-colors ${
                    c.dayNumber === currentDay ? "bg-rose-500/5 font-semibold" : ""
                  }`}
                >
                  <td className="py-4 px-6 font-mono font-bold">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs ${
                        c.dayNumber === currentDay
                          ? "bg-rose-600 text-white"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      D{c.dayNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-zinc-200">
                    <div className="flex items-center space-x-2">
                      <span>{c.title}</span>
                      {c.dayNumber === currentDay && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          TODAY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400 text-xs">
                    {c.topic}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        c.difficulty === "EASY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : c.difficulty === "HARD"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-black text-rose-400">
                    +{c.points}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {isSolved ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Solved</span>
                      </span>
                    ) : isPastOrToday ? (
                      <span className="text-zinc-400 text-xs">Available</span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-zinc-600 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/challenge/${c.dayNumber}`}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
