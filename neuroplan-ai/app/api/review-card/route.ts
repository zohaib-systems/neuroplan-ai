import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateSM2 } from "@/lib/sm2";

type ReviewBody = {
  topicId?: unknown;
  score?: unknown;
};

function toStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReviewBody;
    const topicId = typeof body.topicId === "string" ? body.topicId.trim() : "";
    const score = typeof body.score === "number" ? body.score : Number.NaN;

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: "score must be an integer from 1 to 5" }, { status: 400 });
    }

    const topic = await db.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const sm2 = calculateSM2({
      quality: score,
      prevInterval: topic.interval,
      prevEF: topic.easinessFactor,
      repetitions: topic.repetitions,
    });

    const nextReviewDate = toStartOfDay(new Date());
    nextReviewDate.setDate(nextReviewDate.getDate() + sm2.interval);

    const updatedTopic = await db.topic.update({
      where: { id: topic.id },
      data: {
        interval: sm2.interval,
        easinessFactor: sm2.easinessFactor,
        repetitions: sm2.repetitions,
        nextReviewDate,
      },
      select: {
        id: true,
        interval: true,
        easinessFactor: true,
        repetitions: true,
        nextReviewDate: true,
      },
    });

    return NextResponse.json({ topic: updatedTopic });
  } catch (error: unknown) {
    console.error("Review card API error:", error);

    const message =
      error instanceof Error && error.message ? error.message : "Failed to review card";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
