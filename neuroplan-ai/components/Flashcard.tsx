"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";

type FlashcardProps = {
  front: string;
  back: string;
  topicId: string;
  onReviewSaved?: (updatedTopic: {
    id: string;
    interval: number;
    easinessFactor: number;
    repetitions: number;
    nextReviewDate: string;
  }) => void;
};

export default function Flashcard({ front, back, topicId, onReviewSaved }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const submitReview = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!isFlipped) {
      setReviewError("Flip the card before rating your recall.");
      return;
    }

    setIsSubmitting(true);
    setReviewError(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, rating }),
      });

      const payload = (await res.json()) as {
        error?: string;
        topic?: {
          id: string;
          interval: number;
          easinessFactor: number;
          repetitions: number;
          nextReviewDate: string;
        };
      };

      if (!res.ok) {
        throw new Error(payload.error || "Failed to submit review");
      }

      if (payload.topic && onReviewSaved) {
        onReviewSaved(payload.topic);
      }

      setIsFlipped(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      setReviewError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="group relative h-64 w-full rounded-2xl text-left [perspective:1200px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label={isFlipped ? "Show question side" : "Show answer side"}
      >
        <div
          className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
          }`}
        >
          <div className="absolute inset-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md [backface-visibility:hidden]">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
                Question
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">
                <RotateCw size={14} className="transition-transform duration-300 group-hover:rotate-45" />
                Flip
              </span>
            </div>
            <p className="line-clamp-6 text-lg font-medium leading-relaxed text-slate-900">{front}</p>
          </div>

          <div className="absolute inset-0 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-md [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
                Answer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-700">
                <RotateCw size={14} className="transition-transform duration-300 group-hover:rotate-45" />
                Flip
              </span>
            </div>
            <p className="line-clamp-6 text-base leading-relaxed text-slate-800">{back}</p>
          </div>
        </div>
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rate your recall (1-5)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 1, label: "Again" },
            { value: 2, label: "Hard" },
            { value: 3, label: "Good" },
            { value: 4, label: "Easy" },
            { value: 5, label: "Very Easy" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => submitReview(item.value as 1 | 2 | 3 | 4 | 5)}
              disabled={isSubmitting || !isFlipped}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Submit review rating ${item.value}: ${item.label}`}
            >
              <span className="block text-xs text-slate-500">{item.value}</span>
              <span className="block text-sm">{item.label}</span>
            </button>
          ))}
        </div>
        {!isFlipped && (
          <p className="mt-2 text-xs text-slate-500">Flip the card to reveal the answer, then rate.</p>
        )}
        {reviewError && <p className="mt-2 text-sm text-red-600">{reviewError}</p>}
      </div>
    </div>
  );
}
