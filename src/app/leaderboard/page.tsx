"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Flame, Search, ArrowUp, ArrowDown, Minus, Filter, Sparkles, Building2, GraduationCap } from "lucide-react";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"overall" | "streak" | "branch" | "year" | "consistency">("overall");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab,
        branch: branchFilter,
        year: yearFilter,
        search: searchTerm,
      });

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, branchFilter, yearFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">CODE100 Leaderboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time rankings sorted by points, challenges solved, current streaks, and verified submission timestamps.
          </p>
        </div>

        <button
          onClick={() => {
            fetch("/api/leaderboard?refresh=true").then(() => fetchLeaderboard());
          }}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all self-start md:self-auto"
        >
          Recalculate Snapshot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
        {[
          { key: "overall", label: "Overall Rankings", icon: Trophy },
          { key: "streak", label: "Streak Leaders", icon: Flame },
          { key: "branch", label: "Branch Rankings", icon: Building2 },
          { key: "year", label: "Year Rankings", icon: GraduationCap },
          { key: "consistency", label: "Consistency Score", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-950/40"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter / Search Bar (for Individual ranking tabs) */}
      {(activeTab === "overall" || activeTab === "streak" || activeTab === "consistency") && (
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search participant by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </form>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-zinc-400 font-medium">Branch:</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ISE">ISE</option>
              <option value="AIML">AIML</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-zinc-400 font-medium">Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      )}

      {/* Leaderboard Table Display */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Crunching verified scores and streaks...</span>
        </div>
      ) : activeTab === "branch" ? (
        /* Branch Leaderboard View */
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Branch Name</th>
                <th className="py-4 px-6 text-right">Participants</th>
                <th className="py-4 px-6 text-right">Active Streaks</th>
                <th className="py-4 px-6 text-right">Total Points</th>
                <th className="py-4 px-6 text-right">Avg Points</th>
                <th className="py-4 px-6 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {data.map((b, idx) => (
                <tr key={b.branch} className="hover:bg-zinc-800/20">
                  <td className="py-4 px-6 font-bold">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 inline-flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-white text-base">
                    {b.branch}
                  </td>
                  <td className="py-4 px-6 text-right text-zinc-300 font-mono">
                    {b.participants}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-amber-400 font-mono">
                    🔥 {b.activeParticipants}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-rose-400 font-mono">
                    {b.totalPoints}
                  </td>
                  <td className="py-4 px-6 text-right text-zinc-300 font-mono">
                    {b.averagePoints}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-400 font-mono">
                    {b.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === "year" ? (
        /* Year Leaderboard View */
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Year Group</th>
                <th className="py-4 px-6 text-right">Total Participants</th>
                <th className="py-4 px-6 text-right">Total Points</th>
                <th className="py-4 px-6 text-right">Average Points</th>
                <th className="py-4 px-6 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {data.map((y, idx) => (
                <tr key={y.year} className="hover:bg-zinc-800/20">
                  <td className="py-4 px-6 font-bold">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 inline-flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-white text-base">
                    {y.year}
                  </td>
                  <td className="py-4 px-6 text-right text-zinc-300 font-mono">
                    {y.participants}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-rose-400 font-mono">
                    {y.totalPoints}
                  </td>
                  <td className="py-4 px-6 text-right text-zinc-300 font-mono">
                    {y.averagePoints}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-400 font-mono">
                    {y.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Individual Ranking Table (Overall, Streak, Consistency) */
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Participant</th>
                <th className="py-4 px-6">Branch</th>
                <th className="py-4 px-6">Year</th>
                <th className="py-4 px-6 text-right">Points</th>
                <th className="py-4 px-6 text-right">Solved</th>
                <th className="py-4 px-6 text-right">Current Streak</th>
                <th className="py-4 px-6 text-right">Longest Streak</th>
                <th className="py-4 px-6 text-right">Consistency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {data.map((p, idx) => {
                const displayRank = activeTab === "overall" ? p.rank : idx + 1;
                return (
                  <tr key={p.id || p.userId} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold">
                      {displayRank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs">
                          🥇 1
                        </span>
                      ) : displayRank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-400/20 text-zinc-300 border border-zinc-400/40 text-xs">
                          🥈 2
                        </span>
                      ) : displayRank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 text-xs">
                          🥉 3
                        </span>
                      ) : (
                        <span className="text-zinc-400 ml-2">#{displayRank}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-100">
                      <Link
                        href={`/profile/${p.userId}`}
                        className="hover:text-rose-400 transition-colors"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {p.branch || "CSE"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-xs">
                      Year {p.year || 3}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-rose-400 font-mono">
                      {p.points}
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-300 font-mono">
                      {p.solvedCount} / 100
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-amber-400 font-mono">
                      🔥 {p.currentStreak}d
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-400 font-mono">
                      {p.longestStreak}d
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-400 font-mono">
                      {p.consistencyScore}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
