"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Terminal, Shield, Award, Trophy, User, LogOut, Menu, X, Bell } from "lucide-react";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080c14]/85 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & ACM Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xl tracking-wider text-white">CODE<span className="text-rose-500">100</span></span>
                <span className="text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  GAT ACM
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">100 Days of DSA</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/challenges" className="text-zinc-300 hover:text-white transition-colors">
              Challenges
            </Link>
            <Link href="/leaderboard" className="text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
            {currentUser && (
              <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
            {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
              <Link
                href="/admin"
                className="text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1 font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* User Session Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-zinc-200 font-medium">{currentUser.name.split(" ")[0]}</span>
                  {currentUser.streak && (
                    <span className="text-rose-400 font-bold ml-1">🔥 {currentUser.streak.currentStreak}d</span>
                  )}
                </div>
                <Link
                  href="/profile"
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/40 hover:border-rose-800/40 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all"
                >
                  Join Challenge
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#080c14] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white text-base py-1"
          >
            Home
          </Link>
          <Link
            href="/challenges"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white text-base py-1"
          >
            Challenges
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white text-base py-1"
          >
            Leaderboard
          </Link>
          {currentUser && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-300 hover:text-white text-base py-1"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-300 hover:text-white text-base py-1"
              >
                My Profile
              </Link>
            </>
          )}
          {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-rose-400 font-semibold text-base py-1"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-2">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full text-left text-rose-400 font-medium py-1.5"
              >
                Sign Out ({currentUser.name})
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white"
                >
                  Join Challenge
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
