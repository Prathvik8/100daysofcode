import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEventState } from "@/lib/event";
import ChallengeDetailClient from "@/components/ChallengeDetailClient";

interface Props {
  params: Promise<{ day: string }>;
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);

  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 100) {
    notFound();
  }

  const user = await getCurrentUser();
  const eventState = await calculateEventState();

  const challenge = await prisma.challenge.findUnique({
    where: { dayNumber },
  });

  if (!challenge) {
    notFound();
  }

  let userSubmission = null;
  if (user) {
    userSubmission = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        challengeId: challenge.id,
      },
    });
  }

  return (
    <ChallengeDetailClient
      challenge={challenge}
      user={user}
      userSubmission={userSubmission}
      eventState={eventState}
    />
  );
}
