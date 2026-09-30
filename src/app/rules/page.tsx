import Link from "next/link";
import { ShieldCheck, Flame, Trophy, Award, AlertTriangle, ArrowRight } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Official Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">CODE100 Challenge Rules</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Organized by GAT ACM Student Chapter. 100 Days. 100 Problems. One Streak.
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>1. Daily Challenge & Deadlines</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Every day at 00:00 (Asia/Kolkata), one official curated DSA challenge goes active. Participants must solve the problem on external platforms (LeetCode, CodeChef, HackerRank, GeeksforGeeks) and submit their accepted submission URL by <strong>23:59 PM (Asia/Kolkata)</strong> of the same day.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>2. Streak Calculation & Recovery Tokens</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Your streak increments by +1 for each consecutive day with an approved official challenge submission. If you miss a day due to academic conflicts, illness, or internal exams, you may consume <strong>1 of your 3 Recovery Tokens</strong> within 48 hours to preserve your active streak.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>3. Scoring System</span>
          </h2>
          <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1">
            <li><strong>Easy Problem:</strong> 10 Points</li>
            <li><strong>Medium Problem:</strong> 15 Points</li>
            <li><strong>Hard Problem:</strong> 20 Points</li>
          </ul>
          <p className="text-zinc-400 text-xs mt-2">
            Points are awarded strictly upon verification. Only the official challenge for that day counts towards your verified daily score.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span>4. Leaderboard Ranking & Tie-Breaker Logic</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Rankings are determined by applying the following deterministic cascade:
          </p>
          <ol className="list-decimal list-inside text-zinc-300 text-sm space-y-1 font-mono">
            <li>Total Verified Points (Descending)</li>
            <li>Total Completed Official Challenges (Descending)</li>
            <li>Current Streak Length (Descending)</li>
            <li>Longest Streak Achieved (Descending)</li>
            <li>Earlier Submission Timestamp (Ascending)</li>
          </ol>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>5. Academic Integrity & Anti-Cheating</span>
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            The platform automatically cross-checks solution links for duplicate URLs submitted by different participants, suspicious submission timestamps, and mismatched account usernames. Plagiarized submissions will be flagged, leading to potential disqualification upon ACM mentor review.
          </p>
        </div>
      </div>

      <div className="pt-4 text-center">
        <Link
          href="/register"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/50 transition-all"
        >
          <span>Accept Rules & Join Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
