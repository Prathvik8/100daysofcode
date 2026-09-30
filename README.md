# CODE100 — 100 Days of DSA Challenge

Organized by the **GAT ACM Student Chapter** for the Global Academy of Technology.

> **"100 Days. 100 Problems. One Streak."**

CODE100 is a production-ready, full-stack gamified competitive coding platform architected to cultivate consistent Data Structures & Algorithms problem-solving habits among college students.

---

## 🚀 Key Features

* **Participant System:**
  * College-domain email registration & authentication (JWT HTTP-only cookies).
  * Profile management tracking USN, Branch (CSE, ISE, ECE, AIML, ME, EEE), Year, and platform handles.
  * Public participant profiles hiding sensitive PII (emails/phone/USNs).
* **100-Day DSA Curriculum & Progression:**
  * Handpicked roadmap covering Arrays, Hashing, Two Pointers, Sliding Window, Trees, Heaps, Graphs, and DP.
  * Daily problem details: Title, difficulty, external platform link, constraints, hints, and locked editorials.
* **Submission & Anti-Cheating Engine:**
  * Participants submit external accepted solution links (LeetCode, CodeChef, HackerRank, GitHub).
  * `SubmissionValidator` abstraction detects duplicate URLs across participants, host pattern integrity, and flags suspicious entries.
* **Gamification & Streak Mechanics:**
  * Real-time streak tracking incrementing on daily approved submissions.
  * 3 **Recovery Tokens** per participant to restore broken streaks in case of exams or emergencies.
  * Dynamic Badge system: *Challenger*, *7-Day Streak*, *14-Day Streak*, *30-Day Streak*, *50-Day Streak*, *75-Day Streak*, *100-Day Warrior*, *Problem Solver*, *Hard Coder*, and *Comeback Kid*.
* **Multi-Tab High-Performance Leaderboard:**
  * **Overall Rankings** with deterministic tie-breaking (Points → Solved → Current Streak → Longest Streak → Timestamp).
  * **Streak Leaders** tab.
  * **Branch Leaderboard** with average points and completion rates.
  * **Year Leaderboard** (1st, 2nd, 3rd, 4th Year).
  * **Consistency Score** ranking.
  * Name search and branch/year filters.
* **Admin Command Center:**
  * Submissions moderation queue with instant Approve / Reject / Flag actions and automatic point/streak crediting.
  * Analytics with branch and difficulty distribution visualizations.
  * 100-challenge management and scheduling.
  * Full Audit Log recording administrative actions.
  * CSV Exports for Participants and Submissions.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (App Router, Server Components & Route Handlers)
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS v4 with dark-first ACM aesthetics & glassmorphism
* **Database & ORM:** SQLite (zero-config local persistence) / PostgreSQL compatible via Prisma ORM 6.4.1
* **Authentication:** Stateless JWT sessions via `jose` and `bcryptjs`
* **Icons & Charts:** `lucide-react`, `recharts`

---

## 📦 Installation & Setup

1. **Clone and enter repository:**
   ```bash
   cd "c:\Users\PRATHVIK\Desktop\100 DAYS"
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Database Initialization:**
   ```bash
   npx prisma db push
   ```

4. **Seed Sample Data (100 DSA Challenges, 20 Participants, Badges, Leaderboard):**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gat.ac.in` | `acm@gat2026` |
| **Super Admin** | `superadmin@gat.ac.in` | `acm@gat2026` |
| **Demo Student** | `student@gat.ac.in` | `acm@gat2026` |
| **Other Students** | `student1@gat.ac.in` ... `student20@gat.ac.in` | `acm@gat2026` |

---

## 🏆 Scoring & Rules

* **Easy Challenge:** 10 Points
* **Medium Challenge:** 15 Points
* **Hard Challenge:** 20 Points
* **Deadline:** 11:59 PM (Asia/Kolkata)
* **Tie-Breaker Hierarchy:** Points $\rightarrow$ Problems Solved $\rightarrow$ Current Streak $\rightarrow$ Longest Streak $\rightarrow$ Submission Timestamp.
