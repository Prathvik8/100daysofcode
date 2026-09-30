"use client";

import { useState } from "react";
import { Flame, RefreshCw, Check, AlertCircle } from "lucide-react";

interface DashboardStreakClientProps {
  user: any;
  submissions: any[];
  currentDay: number;
}

export default function DashboardStreakClient({
  user,
  submissions,
  currentDay,
}: DashboardStreakClientProps) {
  const [tokens, setTokens] = useState(user.recoveryTokens || 0);
  const [recoveryReason, setRecoveryReason] = useState("");
  const [targetDay, setTargetDay] = useState(Math.max(1, currentDay - 1));
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate 7-day visualization (previous 6 days + today)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dNum = currentDay - i;
    if (dNum > 0) {
      const isSolved = submissions.some(
        (s) => s.challenge?.dayNumber === dNum && s.status === "APPROVED"
      );
      days.push({ dayNumber: dNum, solved: isSolved, isToday: i === 0 });
    }
  }

  const handleUseRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeDay: targetDay,
          reason: recoveryReason || "Academic / Lab conflict",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to use recovery token");
      }

      setMessage(data.message);
      setTokens((prev: number) => Math.max(0, prev - 1));
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-6">
      {/* 7-Day Consistency Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Recent Streak Grid</h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 font-semibold">
            {user.streak?.currentStreak || 0}d Active
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div
              key={d.dayNumber}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                d.solved
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : d.isToday
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}
            >
              <span className="text-[10px] font-mono font-bold">D{d.dayNumber}</span>
              <span className="text-sm mt-1">
                {d.solved ? "✓" : d.isToday ? "⏳" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Token Widget */}
      <div className="pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Recovery Tokens</h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {tokens} Available
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Missed a challenge due to exams or illness? Use a token within 48 hours to revive your streak.
        </p>

        <button
          onClick={() => setModalOpen(true)}
          disabled={tokens <= 0}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
          <span>{tokens > 0 ? "Use Recovery Token" : "No Tokens Remaining"}</span>
        </button>
      </div>

      {/* Recovery Token Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-700 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-rose-500" />
              <span>Apply Recovery Token</span>
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleUseRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Select Missed Day to Recover
                </label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-rose-500"
                >
                  {Array.from({ length: Math.min(currentDay, 10) }, (_, i) => currentDay - i).map((d) => (
                    <option key={d} value={d}>
                      Day {d} Challenge
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Reason for Exemption
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internal Lab Exam / Medical leave"
                  value={recoveryReason}
                  onChange={(e) => setRecoveryReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50"
                >
                  {loading ? "Restoring..." : "Confirm & Restore"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
