"use client";

import { useState, useEffect } from "react";
import { Clock, Flame, Calendar, Sparkles } from "lucide-react";

interface EventCountdownProps {
  startDate: string; // ISO string
  hasStarted: boolean;
  currentDay: number;
}

export default function EventCountdown({
  startDate,
  hasStarted,
  currentDay,
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    type: "starts_in" | "day_deadline";
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    type: hasStarted ? "day_deadline" : "starts_in",
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const startMs = new Date(startDate).getTime();

      if (!hasStarted && startMs > now) {
        // Event hasn't started yet -> Countdown to Day 1 start
        const diff = Math.max(0, startMs - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, type: "starts_in" });
      } else {
        // Event has started -> Countdown to today's 11:59:59 PM deadline
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const diff = Math.max(0, endOfToday.getTime() - now);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days: 0, hours, minutes, seconds, type: "day_deadline" });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate, hasStarted]);

  return (
    <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
        {timeLeft.type === "starts_in" ? (
          <>
            <Calendar className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-zinc-300">Challenge Starts In:</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-rose-500 animate-spin-slow" />
            <span className="text-zinc-300">Day {currentDay} Deadline:</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1.5 font-mono text-xs font-black">
        {timeLeft.type === "starts_in" && timeLeft.days > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-amber-300 border border-zinc-700">
            {timeLeft.days}d
          </span>
        )}
        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-white border border-zinc-700">
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>
        <span className="text-zinc-500">:</span>
        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-white border border-zinc-700">
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>
        <span className="text-zinc-500">:</span>
        <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}
