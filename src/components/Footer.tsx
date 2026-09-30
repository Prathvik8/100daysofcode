import Link from "next/link";
import { Terminal, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#060910] text-zinc-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-zinc-200 text-sm">CODE100 — 100 Days of DSA</p>
              <p className="text-zinc-500">Organized by GAT ACM Student Chapter</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-zinc-400">
            <Link href="/rules" className="hover:text-zinc-200 transition-colors">
              Rules & Tie-Breakers
            </Link>
            <Link href="/leaderboard" className="hover:text-zinc-200 transition-colors">
              Leaderboard
            </Link>
            <Link href="/challenges" className="hover:text-zinc-200 transition-colors">
              100-Day Roadmap
            </Link>
          </div>

          <div className="text-center md:text-right text-zinc-500">
            <p>© {new Date().getFullYear()} Global Academy of Technology.</p>
            <p className="flex items-center justify-center md:justify-end gap-1 mt-1">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for passionate engineers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
