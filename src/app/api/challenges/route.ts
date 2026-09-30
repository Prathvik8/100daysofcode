import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    const eventState = await calculateEventState();

    if (day) {
      const dayNum = parseInt(day, 10);
      const challenge = await prisma.challenge.findUnique({
        where: { dayNumber: dayNum },
      });

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
      }

      // Hide editorial if not yet released
      const hideEditorial =
        challenge.editorialReleaseAt && new Date() < new Date(challenge.editorialReleaseAt);

      return NextResponse.json({
        challenge: {
          ...challenge,
          editorial: hideEditorial ? null : challenge.editorial,
        },
        eventState,
      });
    }

    // List all challenges
    const challenges = await prisma.challenge.findMany({
      orderBy: { dayNumber: "asc" },
      select: {
        id: true,
        dayNumber: true,
        title: true,
        slug: true,
        topic: true,
        difficulty: true,
        platform: true,
        externalUrl: true,
        points: true,
        status: true,
        startDate: true,
        deadline: true,
      },
    });

    return NextResponse.json({
      challenges,
      eventState,
    });
  } catch (error: any) {
    console.error("Fetch challenges error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}
