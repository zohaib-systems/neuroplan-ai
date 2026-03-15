import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { Topic } from "@prisma/client";
import { env } from "./config";

type FlashcardGenError = Error & { status?: number };

const FlashcardSchema = z.object({
  front: z.string().min(1, "Flashcard front cannot be empty"),
  back: z.string().min(1, "Flashcard back cannot be empty"),
});

const FlashcardsResponseSchema = z.array(FlashcardSchema).length(3);

export type GeneratedFlashcard = z.infer<typeof FlashcardSchema>;

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    const maybeStatus = (error as { status?: unknown; statusCode?: unknown }).status;
    if (typeof maybeStatus === "number") {
      return maybeStatus;
    }

    const maybeStatusCode = (error as { status?: unknown; statusCode?: unknown }).statusCode;
    if (typeof maybeStatusCode === "number") {
      return maybeStatusCode;
    }
  }

  return undefined;
}

function parseJsonResponse(text: string): unknown {
  const trimmed = text.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(withoutFence);
  }

  return JSON.parse(trimmed);
}

export async function generateFlashcardsForTopic(topic: Topic): Promise<GeneratedFlashcard[]> {
  if (!env.AI_KEY) {
    const missingKeyError = new Error(
      "Missing GEMINI_API_KEY. Add it to your .env file and restart the dev server."
    ) as FlashcardGenError;
    missingKeyError.status = 500;
    throw missingKeyError;
  }

  const genAI = new GoogleGenerativeAI(env.AI_KEY);
  const model = genAI.getGenerativeModel({
    model: env.AI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are an expert tutor and instructional designer.
Generate exactly 3 high-quality flashcards for the topic below.

Topic title: ${topic.title}

Rules:
1. Return ONLY valid JSON.
2. The JSON must be an array with exactly 3 objects.
3. Each object must have string fields: "front" and "back".
4. "front" should be a clear question or recall prompt.
5. "back" should be concise, correct, and useful for active recall.
6. Avoid duplicate or near-duplicate flashcards.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const rawJson = parseJsonResponse(responseText);

    return FlashcardsResponseSchema.parse(rawJson);
  } catch (error: unknown) {
    console.error("Flashcard generation failed:", error);

    const status = getErrorStatus(error);
    if (status === 429) {
      const quotaError = new Error(
        "Gemini API quota exceeded. Check billing/rate limits, then try again."
      ) as FlashcardGenError;
      quotaError.status = 429;
      throw quotaError;
    }

    if (status === 404) {
      const modelError = new Error(
        `Gemini model '${env.AI_MODEL}' is unavailable. Set GEMINI_MODEL in .env to a supported model.`
      ) as FlashcardGenError;
      modelError.status = 400;
      throw modelError;
    }

    const parseError = new Error(
      "The AI output did not match the required flashcard format. Please try again."
    ) as FlashcardGenError;
    parseError.status = 500;
    throw parseError;
  }
}
