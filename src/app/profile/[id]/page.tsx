import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Award, Flame, Trophy, CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      streak: true,
      userBadges: { include: { badge: true } },
      submissions: { where: { status: "APPROVED" } },
      scoreTransactions: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    notFound();
  }

  const rankInfo = await prisma.leaderboardSnapshot.findFirst({
    where: { userId: user.id },
  });

  const totalPoints = user.scoreTransactions.reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Public Card (NO private email or phone or USN exposed) */}
      <div className="glass-panel p-8 rounded-3xl border border-zinc-800 text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-rose-600 to-rose-950 flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-rose-950/50">
          {user.name.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <h1 className="text-3xl font-black text-white">{user.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {user.branch || "Engineering"} • Year {user.year || 1}
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            {user.codingPlatform}: {user.platformUsername || "Participant"}
          </p>
        </div>

        {/* Public Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-2xl font-black text-white">#{rankInfo?.rank || 1}</p>
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">College Rank</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-2xl font-black text-rose-400">{totalPoints}</p>
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Points</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-2xl font-black text-amber-400">🔥 {user.streak?.currentStreak || 0}d</p>
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Streak</p>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Earned Badges ({user.userBadges.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.userBadges.map((ub) => (
            <div key={ub.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
              <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-100">{ub.badge.name}</p>
                <p className="text-[11px] text-zinc-400">{ub.badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
