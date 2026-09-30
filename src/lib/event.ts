import { prisma } from "./prisma";

export interface EventState {
  currentDay: number;
  totalDays: number;
  hasStarted: boolean;
  hasEnded: boolean;
  daysRemaining: number;
  daysUntilStart: number;
  settings: {
    eventName: string;
    eventTagline: string;
    organizationName: string;
    startDate: Date;
    endDate: Date;
    easyPoints: number;
    mediumPoints: number;
    hardPoints: number;
    registrationOpen: boolean;
    certificateThresholdProblems: number;
  };
}

export async function getEventSettings() {
  let settings = await prisma.eventSetting.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    const start = new Date();
    // Start today, end 100 days later
    const end = new Date(start.getTime() + 100 * 24 * 60 * 60 * 1000);
    settings = await prisma.eventSetting.create({
      data: {
        id: "global",
        eventName: "CODE100 — 100 Days of DSA",
        eventTagline: "100 Days. 100 Problems. One Streak.",
        organizationName: "GAT ACM Student Chapter",
        startDate: start,
        endDate: end,
        easyPoints: 10,
        mediumPoints: 15,
        hardPoints: 20,
        defaultRecoveryTokens: 3,
        certificateThresholdProblems: 80,
      },
    });
  }

  return settings;
}

export async function calculateEventState(): Promise<EventState> {
  const settings = await getEventSettings();
  const now = new Date();

  // If admin configured a manual currentDay override
  if (settings.currentDayOverride !== null && settings.currentDayOverride !== undefined) {
    const day = Math.min(Math.max(1, settings.currentDayOverride), 100);
    return {
      currentDay: day,
      totalDays: 100,
      hasStarted: true,
      hasEnded: day > 100,
      daysRemaining: Math.max(0, 100 - day),
      daysUntilStart: 0,
      settings: {
        eventName: settings.eventName,
        eventTagline: settings.eventTagline,
        organizationName: settings.organizationName,
        startDate: settings.startDate,
        endDate: settings.endDate,
        easyPoints: settings.easyPoints,
        mediumPoints: settings.mediumPoints,
        hardPoints: settings.hardPoints,
        registrationOpen: settings.registrationOpen,
        certificateThresholdProblems: settings.certificateThresholdProblems,
      },
    };
  }

  const startMs = new Date(settings.startDate).setHours(0, 0, 0, 0);
  const nowMs = now.getTime();
  const diffDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      currentDay: 0,
      totalDays: 100,
      hasStarted: false,
      hasEnded: false,
      daysRemaining: 100,
      daysUntilStart: Math.abs(diffDays),
      settings: {
        eventName: settings.eventName,
        eventTagline: settings.eventTagline,
        organizationName: settings.organizationName,
        startDate: settings.startDate,
        endDate: settings.endDate,
        easyPoints: settings.easyPoints,
        mediumPoints: settings.mediumPoints,
        hardPoints: settings.hardPoints,
        registrationOpen: settings.registrationOpen,
        certificateThresholdProblems: settings.certificateThresholdProblems,
      },
    };
  }

  const calculatedDay = diffDays + 1;
  const isEnded = calculatedDay > 100;
  const currentDay = Math.min(calculatedDay, 100);

  // Auto-sync challenge statuses in background if needed (e.g. at midnight when a new day goes live)
  try {
    await prisma.challenge.updateMany({
      where: {
        dayNumber: { lte: currentDay },
        status: "SCHEDULED",
      },
      data: { status: "ACTIVE" },
    });
  } catch (e) {
    console.error("Auto sync challenge status error:", e);
  }

  return {
    currentDay: isEnded ? 100 : currentDay,
    totalDays: 100,
    hasStarted: true,
    hasEnded: isEnded,
    daysRemaining: Math.max(0, 100 - currentDay),
    daysUntilStart: 0,
    settings: {
      eventName: settings.eventName,
      eventTagline: settings.eventTagline,
      organizationName: settings.organizationName,
      startDate: settings.startDate,
      endDate: settings.endDate,
      easyPoints: settings.easyPoints,
      mediumPoints: settings.mediumPoints,
      hardPoints: settings.hardPoints,
      registrationOpen: settings.registrationOpen,
      certificateThresholdProblems: settings.certificateThresholdProblems,
    },
  };
}
