import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";
import { SYLLABUS_PARSER_PROMPT } from "./prompts";
import { SyllabusResponseSchema } from "./validations/syllabus"; // Import the guardrail

const genAI = new GoogleGenerativeAI(config.aiKey!);

export async function parseSyllabus(rawText: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
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
  } catch (error) {
    // This catches both JSON.parse errors AND Zod validation errors
    console.error("Parsing or Validation failed:", error);
    throw new Error("The AI output didn't match our required format. Please try again.");
  }
}