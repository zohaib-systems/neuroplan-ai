import { NextResponse } from "next/server";
import { db } from "/lib/db"; // Ensure your Prisma client is exported as 'db' in lib/db.ts

export async function POST(req: Request) {
  try {
    const { topics } = await req.json();

    // This moves data from your screen into PostgreSQL
    const savedTopics = await db.topic.createMany({
      data: topics.map((t: any) => ({
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