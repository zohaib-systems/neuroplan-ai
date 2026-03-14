"use client";
import { useState } from "react";
import { Trash2, CheckCircle, BrainCircuit, AlertCircle } from "lucide-react";
import { SyllabusData } from "@/lib/validations/syllabus";

export default function SyllabusReview({ data }: { data: SyllabusData }) {
  const [topics, setTopics] = useState(data.subjects);
  const [saving, setSaving] = useState(false);

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const saveToDb = async () => {
    setSaving(true);
    const res = await fetch("/api/save-syllabus", {
      method: "POST",
      body: JSON.stringify({ topics }),
    });
    if (res.ok) alert("Syllabus Saved! Ready for Phase 3.");
    setSaving(false);
  };

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h2 className="flex items-center gap-2 font-semibold text-slate-700">
          <BrainCircuit size={20} className="text-blue-600" />
          Review AI Topics ({topics.length})
        </h2>
        <button 
          onClick={saveToDb}
          disabled={saving || topics.length === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
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
                <span className="text-sm font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                  Diff: {topic.difficulty}
                </span>
                <h3 className="font-medium text-slate-900">{topic.title}</h3>
              </div>
              <p className="text-sm text-slate-500 max-w-2xl">{topic.description}</p>
            </div>
            <button 
              onClick={() => removeTopic(idx)}
              className="text-slate-300 hover:text-red-500 p-2 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}