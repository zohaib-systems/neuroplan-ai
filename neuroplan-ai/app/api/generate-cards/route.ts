import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFlashcardsForTopic } from "@/lib/flashcard-gen";

type RouteError = Error & { status?: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topicId = typeof body?.topicId === "string" ? body.topicId.trim() : "";

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    const topic = await db.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const generatedCards = await generateFlashcardsForTopic(topic);

    const savedCards = await db.$transaction(
      generatedCards.map((card) =>
        db.flashcard.create({
          data: {
            topicId: topic.id,
            front: card.front,
            back: card.back,
          },
        })
      )
    );

    return NextResponse.json({ cards: savedCards }, { status: 200 });
  } catch (error: unknown) {
    console.error("Generate cards API error:", error);

    const status =
      typeof error === "object" &&
      error !== null &&
      typeof (error as { status?: unknown }).status === "number"
        ? ((error as { status?: number }).status ?? 500)
        : 500;

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to generate flashcards";

    return NextResponse.json({ error: message }, { status });
  }
}
