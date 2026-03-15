import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const SaveSyllabusBodySchema = z.object({
  topics: z.array(
    z.object({
      title: z.string().min(2).max(100),
      description: z.string().min(10).max(500),
      difficulty: z.number().int().min(1).max(5),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { topics } = SaveSyllabusBodySchema.parse(rawBody);

    // This moves data from your screen into PostgreSQL
    const savedTopics = await db.topic.createMany({
      data: topics.map((t) => ({
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        easinessFactor: 2.5,    // Starting value for SM-2
        nextReviewDate: new Date(), // Set first review for today
      })),
    });

    return NextResponse.json({ success: true, count: savedTopics.count });
  } catch (error) {
    console.error("Database Save Error:", error);
    return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
  }
}