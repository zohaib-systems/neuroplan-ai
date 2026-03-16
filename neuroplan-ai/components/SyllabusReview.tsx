"use client";
import { useState } from "react";
import { Trash2, CheckCircle, BrainCircuit } from "lucide-react";
import { SyllabusData } from "@/lib/validations/syllabus";
import FlashcardPlayer from "@/components/FlashcardPlayer";

type SavedTopic = {
  id: string;
  title: string;
  description: string;
  difficulty: number;
};

type DeckCard = {
  id: string;
  topicId: string;
  front: string;
  back: string;
};

export default function SyllabusReview({ data }: { data: SyllabusData }) {
  const [topics, setTopics] = useState(data.subjects);
  const [saving, setSaving] = useState(false);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [generatedCards, setGeneratedCards] = useState<DeckCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
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

      const payload = (await res.json()) as {
        topics?: SavedTopic[];
      };

      setSavedTopics(Array.isArray(payload.topics) ? payload.topics : []);
      setGeneratedCards([]);
      setGenerationMessage("Syllabus saved. Generate flashcards to start Study Mode.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save syllabus topics.";
      setSaveError(message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const generateDeck = async () => {
    if (savedTopics.length === 0) {
      setGenerationMessage("Save your topics first, then generate flashcards.");
      return;
    }

    setGenerating(true);
    setSaveError(null);
    setGenerationMessage("Generating flashcards with Gemini...");

    try {
      const allCards: DeckCard[] = [];

      for (const topic of savedTopics) {
        const res = await fetch("/api/generate-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: topic.id }),
        });

        const payload = (await res.json()) as {
          error?: string;
          cards?: DeckCard[];
        };

        if (!res.ok) {
          throw new Error(payload.error || `Failed to generate flashcards for ${topic.title}`);
        }

        if (Array.isArray(payload.cards)) {
          allCards.push(...payload.cards);
        }
      }

      setGeneratedCards(allCards);
      setGenerationMessage(`Deck ready: ${allCards.length} cards generated across ${savedTopics.length} topics.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate flashcards.";
      setGenerationMessage(message);
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-700">
            <BrainCircuit size={20} className="text-blue-600" />
            Review AI Topics ({topics.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={saveToDb}
              type="button"
              aria-label="Confirm and save syllabus topics"
              disabled={saving || topics.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {saving ? "Saving..." : "Confirm & Save"}
            </button>
            <button
              onClick={generateDeck}
              type="button"
              aria-label="Generate flashcards for saved topics"
              disabled={generating || savedTopics.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              <BrainCircuit size={18} />
              {generating ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
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
                type="button"
                aria-label={`Remove topic ${topic.title}`}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {(saveError || generationMessage) && (
          <div className="m-4 space-y-2">
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {generationMessage && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                {generationMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {generatedCards.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">Study Mode</h3>
          <FlashcardPlayer cards={generatedCards} />
        </div>
      )}
    </div>
  );
}