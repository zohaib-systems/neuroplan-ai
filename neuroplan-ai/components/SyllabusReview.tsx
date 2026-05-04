"use client";
import { useState } from "react";
import { Trash2, CheckCircle, BrainCircuit } from "lucide-react";
import { SyllabusData } from "@/lib/validations/syllabus";

type Props = {
  data: SyllabusData;
  onSaved?: () => void;
};

function difficultyBadgeClass(difficulty: number): string {
  if (difficulty <= 2) return "bg-green-100 text-green-700 border border-green-200";
  if (difficulty === 3) return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  return "bg-red-100 text-red-700 border border-red-200";
}

function difficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Easy";
  if (difficulty === 3) return "Medium";
  return "Hard";
}

export default function SyllabusReview({ data, onSaved }: Props) {
  const [topics, setTopics] = useState(data.subjects);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const saveToDb = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/save-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });

      if (!res.ok) {
        let message = "Failed to save syllabus topics.";
        try {
          const payload = await res.json();
          if (typeof payload?.error === "string" && payload.error.trim()) {
            message = payload.error;
          }
        } catch {
          // Keep fallback message when non-JSON response is returned.
        }
        throw new Error(message);
      }

      setSaved(true);
      onSaved?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save syllabus topics.";
      setSaveError(message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-wrap justify-between items-center gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <BrainCircuit size={20} />
            Review AI Topics ({topics.length})
          </h2>
          <button
            onClick={saveToDb}
            type="button"
            aria-label="Confirm and save syllabus topics"
            disabled={saving || topics.length === 0}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all disabled:opacity-50 font-medium"
          >
            <CheckCircle size={18} />
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {topics.map((topic, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 flex justify-between items-start group">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyBadgeClass(topic.difficulty)}`}>
                    {difficultyLabel(topic.difficulty)} ({topic.difficulty})
                  </span>
                  <h3 className="font-medium text-slate-900">{topic.title}</h3>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">{topic.description}</p>
              </div>
              <button
                onClick={() => removeTopic(idx)}
                type="button"
                aria-label={`Remove topic ${topic.title}`}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {(saveError || saved) && (
          <div className="m-4 space-y-2">
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saved && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={16} />
                Syllabus saved successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
