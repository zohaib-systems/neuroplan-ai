"use client";
import { useState } from "react";
import SyllabusUpload from "@/components/SyllabusUpload";
import SyllabusReview from "@/components/SyllabusReview";
import { SyllabusData } from "@/lib/validations/syllabus";

export default function Home() {
  const [parsedData, setParsedData] = useState<SyllabusData | null>(null);

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">NeuroPlan AI</h1>
        <p className="text-slate-500 mt-2">Upload your syllabus. Master your memory.</p>
      </header>

      {/* If no data, show upload. If data, show review. */}
      {!parsedData ? (
        <SyllabusUpload onComplete={(data) => setParsedData(data)} />
      ) : (
        <SyllabusReview data={parsedData} />
      )}
    </main>
  );
}
