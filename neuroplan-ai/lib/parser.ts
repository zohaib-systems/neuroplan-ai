import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./config";
import { SYLLABUS_PARSER_PROMPT } from "./prompts";
import { SyllabusResponseSchema } from "./validations/syllabus"; // Import the guardrail

type ParserError = Error & { status?: number };

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

export async function parseSyllabus(rawText: string) {
  if (!env.AI_KEY) {
    const missingKeyError = new Error(
      "Missing GEMINI_API_KEY. Add it to your .env file and restart the dev server."
    ) as ParserError;
    missingKeyError.status = 500;
    throw missingKeyError;
  }

  const genAI = new GoogleGenerativeAI(env.AI_KEY);
  const model = genAI.getGenerativeModel({ 
    model: env.AI_MODEL,
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `${SYLLABUS_PARSER_PROMPT}\n\nSyllabus text:\n${rawText}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 1. Convert the string to a JavaScript object
    const rawJson = JSON.parse(responseText);
    
    // 2. THE GUARDRAIL: Validate the object against our schema
    // If the AI missed a field, this line will throw an error immediately
    const validatedData = SyllabusResponseSchema.parse(rawJson);
    
    return validatedData; 
  } catch (error: unknown) {
    // This catches both JSON.parse errors AND Zod validation errors
    console.error("Parsing or Validation failed:", error);

    const status = getErrorStatus(error);
    if (status === 429) {
      const quotaError = new Error(
        "Gemini API quota exceeded. Check billing/rate limits, then try again."
      ) as ParserError;
      quotaError.status = 429;
      throw quotaError;
    }

    if (status === 404) {
      const modelError = new Error(
        `Gemini model '${env.AI_MODEL}' is unavailable. Set GEMINI_MODEL in .env to a supported model.`
      ) as ParserError;
      modelError.status = 400;
      throw modelError;
    }

    const parseError = new Error(
      "The AI output didn't match our required format. Please try again."
    ) as ParserError;
    parseError.status = 500;
    throw parseError;
  }
}