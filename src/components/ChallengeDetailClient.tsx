"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, ExternalLink, Clock, Award, Shield, CheckCircle2, AlertCircle, ArrowLeft, Send, Sparkles, Lock } from "lucide-react";

interface Props {
  challenge: any;
  user: any;
  userSubmission: any;
  eventState: any;
}

export default function ChallengeDetailClient({
  challenge,
  user,
  userSubmission,
  eventState,
}: Props) {
  const [solutionUrl, setSolutionUrl] = useState(userSubmission?.solutionUrl || "");
  const [code, setCode] = useState(userSubmission?.code || "");
  const [platform, setPlatform] = useState(challenge.platform || "LeetCode");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<any>(userSubmission);
  const [showHint, setShowHint] = useState(false);
  const [showEditorial, setShowEditorial] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          solutionUrl,
          platform,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit solution");
      }

      setCurrentSub(data.submission);
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = currentSub?.status === "APPROVED";
  const isPending = currentSub?.status === "PENDING";
  const isFlagged = currentSub?.status === "FLAGGED";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/challenges"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All 100 Challenges</span>
        </Link>

        <span className="text-xs font-mono text-zinc-400">
          Day {challenge.dayNumber} of 100
        </span>
      </div>

      {/* Main Challenge Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-zinc-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1 rounded-xl text-xs font-mono font-black bg-rose-600 text-white shadow-md shadow-rose-950/40">
              DAY {challenge.dayNumber}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {challenge.topic}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-xl border ${
                challenge.difficulty === "EASY"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : challenge.difficulty === "HARD"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              +{challenge.points} Points
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {challenge.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Submission Deadline: <strong>11:59 PM (Asia/Kolkata)</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <span>External Platform: <strong className="text-zinc-200">{challenge.platform}</strong></span>
          </div>
        </div>

        {/* Problem Description & Details */}
        <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Problem Statement</h2>
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
            {challenge.description}
          </div>

          {challenge.examples && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Examples & IO</h2>
              <pre className="p-4 rounded-2xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 whitespace-pre-wrap">
                {challenge.examples}
              </pre>
            </div>
          )}

          {challenge.constraints && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Constraints</h2>
              <p className="font-mono text-xs text-zinc-400 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                {challenge.constraints}
              </p>
            </div>
          )}
        </div>

        {/* External Platform Link */}
        <div className="pt-2">
          <a
            href={challenge.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm shadow-md transition-all group"
          >
            <span>Solve on {challenge.platform}</span>
            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </a>
        </div>

        {/* Hints & Editorial Accordion */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          {challenge.hint && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{showHint ? "Hide Algorithmic Hint" : "View Algorithmic Hint"}</span>
                </span>
                <span>{showHint ? "▲" : "▼"}</span>
              </button>
              {showHint && (
                <p className="mt-3 text-sm text-zinc-300 border-t border-zinc-800 pt-3">
                  {challenge.hint}
                </p>
              )}
            </div>
          )}

          {challenge.editorial && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <button
                type="button"
                onClick={() => setShowEditorial(!showEditorial)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400"
              >
                <span className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{showEditorial ? "Hide Official Editorial" : "View Official Editorial"}</span>
                </span>
                <span>{showEditorial ? "▲" : "▼"}</span>
              </button>
              {showEditorial && (
                <div className="mt-3 text-sm text-zinc-300 border-t border-zinc-800 pt-3 leading-relaxed">
                  {challenge.editorial}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submission Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">Submit Your Solution</h2>
            <p className="text-zinc-400 text-xs mt-1">
              Provide the accepted solution link from your coding platform. Submissions are strictly verified server-side.
            </p>
          </div>
          {user && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Submitting as:</span>
              <span className="font-bold text-white">{user.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  user.role === "SUPER_ADMIN"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : user.role === "ADMIN"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {user.role}
              </span>
            </div>
          )}
        </div>

        {/* Event Not Started or Challenge Locked Notice */}
        {!eventState.hasStarted ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start space-x-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Challenge Submissions Locked</p>
              <p className="text-xs mt-1 opacity-90 text-amber-200/90">
                The CODE100 challenge has not officially started yet. Submissions for Day 1 will open once the countdown reaches zero.
              </p>
            </div>
          </div>
        ) : challenge.dayNumber > eventState.currentDay ? (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm flex items-start space-x-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-zinc-500" />
            <div>
              <p className="font-bold">Day {challenge.dayNumber} is Locked</p>
              <p className="text-xs mt-1 text-zinc-400">
                This challenge will automatically unlock when Day {challenge.dayNumber} goes live. Currently active: Day {eventState.currentDay}.
              </p>
            </div>
          </div>
        ) : null}

        {/* Existing submission status notice */}
        {currentSub && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-start space-x-3 ${
              isApproved
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : isPending
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Submission Status: {currentSub.status}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {isApproved
                  ? `Verified by mentor! Awarded +${currentSub.pointsAwarded} points.`
                  : isPending
                  ? "Submission pending manual/automatic verification. Points will be credited once verified."
                  : "Submission was flagged or rejected by admin."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Accepted {challenge.platform} Solution URL *
              </label>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-rose-400 border border-zinc-700">
                Target: {challenge.platform}
              </span>
            </div>
            <input
              type="url"
              required
              disabled={isApproved}
              placeholder={`https://${challenge.platform.toLowerCase()}.com/problems/...`}
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Optional Code Snippet (C++, Java, Python)
            </label>
            <textarea
              rows={4}
              disabled={isApproved}
              placeholder="// Paste your solution code here for audit verification"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-rose-500 disabled:opacity-50"
            />
          </div>

          {!isApproved && eventState.hasStarted && challenge.dayNumber <= eventState.currentDay ? (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Verifying & Submitting..." : isPending ? "Update Submission" : "Submit Daily Solution"}</span>
            </button>
          ) : !eventState.hasStarted ? (
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm font-bold cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span>Submissions Locked Until Event Starts</span>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
