import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const eventState = await calculateEventState();

  const [
    totalParticipants,
    submissions,
    challenges,
    announcements,
    auditLogs,
    settings,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PARTICIPANT" },
      include: { streak: true },
    }),
    prisma.submission.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, studentId: true, branch: true, year: true } },
        challenge: { select: { dayNumber: true, title: true, points: true, difficulty: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 100,
    }),
    prisma.challenge.findMany({
      orderBy: { dayNumber: "asc" },
    }),
    prisma.announcement.findMany({
      orderBy: { publishAt: "desc" },
    }),
    prisma.auditLog.findMany({
      include: { admin: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
    prisma.eventSetting.findUnique({
      where: { id: "global" },
    }),
  ]);

  return (
    <AdminDashboardClient
      user={user}
      eventState={eventState}
      participants={totalParticipants}
      initialSubmissions={submissions}
      challenges={challenges}
      announcements={announcements}
      auditLogs={auditLogs}
      settings={settings}
    />
  );
}
