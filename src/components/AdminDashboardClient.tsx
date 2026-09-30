"use client";

import { useState } from "react";
import { Shield, Users, CheckCircle2, Clock, AlertTriangle, Download, FileText, Settings, Award, Flame, Search, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  user: any;
  eventState: any;
  participants: any[];
  initialSubmissions: any[];
  challenges: any[];
  announcements: any[];
  auditLogs: any[];
  settings: any;
}

export default function AdminDashboardClient({
  user,
  eventState,
  participants,
  initialSubmissions,
  challenges,
  announcements,
  auditLogs,
  settings,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "challenges" | "participants" | "audit" | "settings">("overview");
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [subFilter, setSubFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Super Admin Event Timeline State
  const [eventStartDate, setEventStartDate] = useState(
    settings?.startDate ? new Date(settings.startDate).toISOString().split("T")[0] : ""
  );
  const [currentDayOverride, setCurrentDayOverride] = useState(
    settings?.currentDayOverride !== null && settings?.currentDayOverride !== undefined
      ? String(settings.currentDayOverride)
      : ""
  );
  const [easyPts, setEasyPts] = useState(settings?.easyPoints || 10);
  const [medPts, setMedPts] = useState(settings?.mediumPoints || 15);
  const [hardPts, setHardPts] = useState(settings?.hardPoints || 20);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: eventStartDate ? new Date(eventStartDate).toISOString() : undefined,
          currentDayOverride: currentDayOverride === "" ? null : parseInt(currentDayOverride, 10),
          easyPoints: easyPts,
          mediumPoints: medPts,
          hardPoints: hardPts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setMessage("Event configuration synchronized! Reloading updated state...");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Stats calculation
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const flaggedCount = submissions.filter((s) => s.status === "FLAGGED").length;

  const handleUpdateSubmission = async (submissionId: string, status: "APPROVED" | "REJECTED" | "FLAGGED") => {
    setActionLoading(submissionId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update submission");

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
      );
      setMessage(`Submission ${status.toLowerCase()} successfully.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubmissions = submissions.filter((s) =>
    subFilter === "ALL" ? true : s.status === subFilter
  );

  // Chart data: branch breakdown
  const branchMap: Record<string, number> = {};
  for (const p of participants) {
    const b = p.branch || "Other";
    branchMap[b] = (branchMap[b] || 0) + 1;
  }
  const branchChartData = Object.entries(branchMap).map(([name, count]) => ({ name, count }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Command Center</h1>
              <p className="text-zinc-400 text-xs mt-0.5">
                Logged in as <strong className="text-zinc-200">{user.name}</strong> ({user.role}) • Day {eventState.currentDay} Active
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export?type=participants"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Participants CSV</span>
          </a>
          <a
            href="/api/admin/export?type=submissions"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Submissions CSV</span>
          </a>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
        {[
          { key: "overview", label: "Overview & Analytics", count: null },
          { key: "submissions", label: "Submissions Moderation", count: pendingCount },
          { key: "challenges", label: "100 Challenges", count: challenges.length },
          { key: "participants", label: "Participants", count: participants.length },
          { key: "audit", label: "Audit Logs", count: auditLogs.length },
          ...(user.role === "SUPER_ADMIN"
            ? [{ key: "settings", label: "⚡ Event Timeline & Settings", count: null }]
            : []),
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-950/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-300"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Participants</p>
              <p className="text-3xl font-black text-white mt-1">{participants.length}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Across 6 College Branches</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pending Submissions</p>
              <p className="text-3xl font-black text-amber-400 mt-1">{pendingCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Awaiting mentor verification</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Approved Submissions</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">{approvedCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Total points credited</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Flagged Suspicious</p>
              <p className="text-3xl font-black text-rose-500 mt-1">{flaggedCount}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Duplicate / Plagiarism check</p>
            </div>
          </div>

          {/* Branch Distribution Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-white">Participation by College Branch</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                  <YAxis stroke="#a1a1aa" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  />
                  <Bar dataKey="count" fill="#e11d48" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSIONS MODERATION TAB */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Filter Status:</span>
              {["ALL", "PENDING", "APPROVED", "FLAGGED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    subFilter === s
                      ? "bg-rose-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Day & Problem</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Solution Link</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Submitted At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-rose-400">Day {sub.challenge.dayNumber}</span>
                      <p className="font-bold text-zinc-200 text-xs">{sub.challenge.title}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-zinc-200">{sub.user.name}</p>
                      <p className="text-[11px] font-mono text-zinc-400">{sub.user.studentId} • {sub.user.branch}</p>
                    </td>
                    <td className="py-4 px-6 text-xs max-w-xs truncate">
                      <a
                        href={sub.solutionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate">{sub.solutionUrl}</span>
                      </a>
                      {sub.suspiciousFlag && (
                        <p className="text-[10px] text-amber-400 font-semibold mt-1">
                          ⚠️ {sub.suspiciousFlag}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          sub.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : sub.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : sub.status === "FLAGGED"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-zinc-400 font-mono">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {sub.status !== "APPROVED" && (
                        <button
                          onClick={() => handleUpdateSubmission(sub.id, "APPROVED")}
                          disabled={actionLoading === sub.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {sub.status !== "REJECTED" && (
                        <button
                          onClick={() => handleUpdateSubmission(sub.id, "REJECTED")}
                          disabled={actionLoading === sub.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Day</th>
                  <th className="py-4 px-6">Challenge Title</th>
                  <th className="py-4 px-6">Topic</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6 text-right">Points</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {challenges.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">
                      Day {c.dayNumber}
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-200">
                      {c.title}
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-xs">{c.topic}</td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-rose-400 font-mono">
                      {c.points}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PARTICIPANTS TAB */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">USN / Email</th>
                  <th className="py-4 px-6">Branch & Year</th>
                  <th className="py-4 px-6">Platform Handle</th>
                  <th className="py-4 px-6 text-right">Streak</th>
                  <th className="py-4 px-6 text-right">Recovery Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6 font-bold text-zinc-200">{p.name}</td>
                    <td className="py-4 px-6 text-xs text-zinc-400 font-mono">
                      {p.studentId || "N/A"} • {p.email}
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-300">
                      {p.branch} • Year {p.year}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-zinc-400">
                      {p.codingPlatform}: {p.platformUsername || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-amber-400 font-mono">
                      🔥 {p.streak?.currentStreak || 0}d
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-zinc-300">
                      {p.recoveryTokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Admin</th>
                  <th className="py-4 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/20 text-xs">
                    <td className="py-4 px-6 font-bold text-rose-400">{log.action}</td>
                    <td className="py-4 px-6 text-zinc-300 font-mono">{log.targetType} ({log.targetId?.slice(0, 8)})</td>
                    <td className="py-4 px-6 text-zinc-400">{log.admin?.name || "System"}</td>
                    <td className="py-4 px-6 text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVENT SETTINGS TAB (SUPER ADMIN ONLY) */}
      {activeTab === "settings" && user.role === "SUPER_ADMIN" && (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 max-w-3xl space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
            <div className="p-2.5 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Event Timeline & Global Date Control</h2>
              <p className="text-zinc-400 text-xs mt-0.5">
                Super Admin Master Controls: Changes synchronize all 100 challenge dates, streaks, and deadlines across the entire college.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Official Event Start Date (Day 1)
                </label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-rose-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Adjusting this re-aligns deadlines for all 100 daily problems automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Current Day Manual Override (1 – 100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Leave empty for auto-calculated date"
                  value={currentDayOverride}
                  onChange={(e) => setCurrentDayOverride(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-rose-500 font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Leave empty to auto-calculate from start date. Set e.g. <strong>1</strong> to start on Day 1.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-200 mb-3 uppercase tracking-wider">
                Scoring Configuration (Points per Challenge)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-emerald-400 font-semibold mb-1">Easy Points</label>
                  <input
                    type="number"
                    value={easyPts}
                    onChange={(e) => setEasyPts(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-amber-400 font-semibold mb-1">Medium Points</label>
                  <input
                    type="number"
                    value={medPts}
                    onChange={(e) => setMedPts(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-rose-400 font-semibold mb-1">Hard Points</label>
                  <input
                    type="number"
                    value={hardPts}
                    onChange={(e) => setHardPts(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={settingsLoading}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/50 transition-all disabled:opacity-50"
              >
                {settingsLoading ? "Synchronizing Platform..." : "Save & Replicate Across Website"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
