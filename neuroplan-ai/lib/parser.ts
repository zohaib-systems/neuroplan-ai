import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";
import { SYLLABUS_PARSER_PROMPT } from "./prompts";

// Initialize the AI with your secret key
const genAI = new GoogleGenerativeAI(config.aiKey!);

export async function parseSyllabus(rawText: string) {
  // Use 'gemini-1.5-flash' for speed and cost-efficiency
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } // Forces JSON output
  });

  const prompt = `${SYLLABUS_PARSER_PROMPT}\n\nHere is the syllabus text:\n${rawText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Convert the string response into a real JavaScript Object
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw new Error("Failed to parse syllabus. Check your API key or input text.");
  }
}