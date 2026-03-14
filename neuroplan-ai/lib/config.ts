// lib/config.ts
export const env = {
  AI_KEY: process.env.GEMINI_API_KEY || "",
  DB_URL: process.env.DATABASE_URL || "",
};

if (!env.AI_KEY) {
  console.warn("⚠️ Warning: AI_API_KEY is missing in .env file");
}