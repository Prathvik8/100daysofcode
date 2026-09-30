import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateEventState, getEventSettings } from "@/lib/event";
import { GamificationEngine } from "@/lib/gamification";

export async function GET() {
  try {
    const settings = await getEventSettings();
    const eventState = await calculateEventState();
    return NextResponse.json({ settings, eventState });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch event settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Only Super Admin has authority to configure event dates and timeline." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      startDate,
      currentDayOverride,
      eventName,
      eventTagline,
      easyPoints,
      mediumPoints,
      hardPoints,
      registrationOpen,
    } = body;

    const currentSettings = await getEventSettings();

    let newStart = currentSettings.startDate;
    let newEnd = currentSettings.endDate;

    if (startDate) {
      newStart = new Date(startDate);
      newEnd = new Date(newStart.getTime() + 100 * 24 * 60 * 60 * 1000);

      // Re-align all 100 challenge dates with the new start date
      const challenges = await prisma.challenge.findMany({ orderBy: { dayNumber: "asc" } });
      for (const c of challenges) {
        const cStart = new Date(newStart.getTime() + (c.dayNumber - 1) * 24 * 60 * 60 * 1000);
        cStart.setHours(0, 0, 0, 0);
        const cDeadline = new Date(cStart.getTime() + 24 * 60 * 60 * 1000 - 1000);

        await prisma.challenge.update({
          where: { id: c.id },
          data: {
            startDate: cStart,
            deadline: cDeadline,
          },
        });
      }
    }

    const updated = await prisma.eventSetting.update({
      where: { id: "global" },
      data: {
        startDate: newStart,
        endDate: newEnd,
        currentDayOverride:
          currentDayOverride !== undefined && currentDayOverride !== ""
            ? currentDayOverride === null
              ? null
              : parseInt(currentDayOverride, 10)
            : currentSettings.currentDayOverride,
        eventName: eventName || currentSettings.eventName,
        eventTagline: eventTagline || currentSettings.eventTagline,
        easyPoints: easyPoints ? parseInt(easyPoints, 10) : currentSettings.easyPoints,
        mediumPoints: mediumPoints ? parseInt(mediumPoints, 10) : currentSettings.mediumPoints,
        hardPoints: hardPoints ? parseInt(hardPoints, 10) : currentSettings.hardPoints,
        registrationOpen: registrationOpen !== undefined ? registrationOpen : currentSettings.registrationOpen,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "EVENT_SETTINGS_UPDATED",
        targetType: "EventSetting",
        targetId: "global",
        oldValue: JSON.stringify({
          startDate: currentSettings.startDate,
          currentDayOverride: currentSettings.currentDayOverride,
        }),
        newValue: JSON.stringify({
          startDate: updated.startDate,
          currentDayOverride: updated.currentDayOverride,
        }),
      },
    });

    // Re-evaluate and sync challenges status (ACTIVE vs SCHEDULED)
    const newEventState = await calculateEventState();
    const activeDay = newEventState.currentDay;

    await prisma.challenge.updateMany({
      where: { dayNumber: { lte: activeDay } },
      data: { status: "ACTIVE" },
    });

    await prisma.challenge.updateMany({
      where: { dayNumber: { gt: activeDay } },
      data: { status: "SCHEDULED" },
    });

    // Refresh Leaderboard snapshot
    await GamificationEngine.refreshLeaderboard();

    return NextResponse.json({
      success: true,
      message: "Event settings updated and synchronized across all 100 challenges, dates, and leaderboards.",
      settings: updated,
      eventState: newEventState,
    });
  } catch (error: any) {
    console.error("Superadmin event update error:", error);
    return NextResponse.json({ error: "Failed to update event configuration" }, { status: 500 });
  }
}
