"use client";
import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

interface UploadProps {
  onComplete: (data: any) => void;
}

export default function SyllabusUpload({ onComplete }: UploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse-syllabus", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse syllabus");

      const data = await response.json();
      
      // Pass the AI-structured data back up to the Page component
      onComplete(data);
    } catch (err) {
      setError("Something went wrong. Please ensure your API key is set up.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
        loading ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-blue-400"
      }`}>
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload"
          disabled={loading}
          accept=".pdf,.txt"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {loading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-blue-600 font-medium text-lg">AI is architecting your study plan...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                <UploadCloud size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500">University Syllabus (PDF or TXT)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}