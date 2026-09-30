import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODE100 — 100 Days of DSA | GAT ACM Student Chapter",
  description:
    "Join CODE100, the premiere 100-day Data Structures & Algorithms consistency challenge organized by GAT ACM Student Chapter. 100 Days. 100 Problems. One Streak.",
  keywords: ["DSA", "LeetCode", "Coding Challenge", "GAT ACM", "100 Days of Code", "Algorithms"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-zinc-100 flex flex-col min-h-screen selection:bg-rose-500/30 selection:text-rose-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
