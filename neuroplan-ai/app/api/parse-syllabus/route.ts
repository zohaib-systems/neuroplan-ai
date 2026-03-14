import { NextResponse } from "next/server";
import { parseSyllabus } from "@/lib/parser";

// We use "POST" because we are sending data (the file) to the server
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    // Safety check: Did the user actually send a file?
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Convert the uploaded file into raw text
    // Note: This works best for .txt or clean PDFs. 
    // We can add advanced PDF-parsing libraries later if needed.
    const rawText = await file.text(); 
    
    // 2. Send the text to the AI Parser (lib/parser.ts)
    // This uses your Gemini key and the Zod guardrail
    const structuredData = await parseSyllabus(rawText);

    // 3. Send the clean JSON back to your Frontend (SyllabusReview.tsx)
    return NextResponse.json(structuredData);
    
  } catch (error: any) {
    console.error("Syllabus API Error:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to process syllabus" }, 
      { status: 500 }
    );
  }
}