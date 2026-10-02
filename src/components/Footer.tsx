import Link from "next/link";
import Image from "next/image";
import { Globe, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#060910] text-zinc-400 text-xs py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand with ACM Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow-md border border-white/20">
              <Image
                src="/acm_logo.png"
                alt="GAT ACM Student Chapter"
                width={85}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm tracking-wide">CODE100 — 100 Days of DSA</p>
              <p className="text-zinc-400 font-medium">Organized by GAT ACM Student Chapter</p>
            </div>
          </div>

          {/* Quick Platform Links */}
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

          {/* Copyright & Signoff */}
          <div className="text-center md:text-right text-zinc-500">
            <p>© {new Date().getFullYear()} Global Academy of Technology.</p>
            <p className="flex items-center justify-center md:justify-end gap-1 mt-1 font-medium text-zinc-400">
              Built by <span className="text-rose-400 font-semibold tracking-wide">GAT ACM STUDENT CHAPTER</span>
            </p>
          </div>
        </div>

        {/* Social Media & Official Channels Bar */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Connect with GAT ACM:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Instagram: acm_gat */}
            <a
              href="https://www.instagram.com/acm_gat/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-pink-900/40 border border-zinc-800 hover:border-pink-500/50 text-zinc-300 hover:text-white transition-all text-xs font-medium group"
              title="Follow acm_gat on Instagram"
            >
              <svg className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>acm_gat</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>

            {/* LinkedIn: GAT ACM STUDENT CHAPTER */}
            <a
              href="https://www.linkedin.com/in/acm-studentchapter-gat-16a58737a/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-blue-950/40 border border-zinc-800 hover:border-blue-500/50 text-zinc-300 hover:text-white transition-all text-xs font-medium group"
              title="Connect with GAT ACM STUDENT CHAPTER on LinkedIn"
            >
              <svg className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>GAT ACM STUDENT CHAPTER</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>

            {/* Official Website: gat-acm.web.app */}
            <a
              href="https://gat-acm.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/50 text-zinc-300 hover:text-white transition-all text-xs font-medium group"
              title="Visit Official GAT ACM Website"
            >
              <Globe className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>gat-acm.web.app</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
