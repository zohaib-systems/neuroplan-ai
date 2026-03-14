// lib/config.ts
export const env = {
  AI_KEY: process.env.GEMINI_API_KEY || "",
  AI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  DB_URL: process.env.DATABASE_URL || "",
};

if (!env.AI_KEY) {
  console.warn("Warning: GEMINI_API_KEY is missing in .env file");
}