"use client";

import { useMemo, useState } from "react";
import Flashcard from "@/components/Flashcard";

type DeckCard = {
  id: string;
  topicId: string;
  front: string;
  back: string;
};

type FlashcardPlayerProps = {
  cards: DeckCard[];
};

export default function FlashcardPlayer({ cards }: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const total = cards.length;
  const currentCard = cards[currentIndex];

  const progressPercent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((completed.length / total) * 100);
  }, [completed.length, total]);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
        No flashcards in this deck yet.
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-emerald-800">Deck Completed</h3>
        <p className="text-sm text-emerald-700">
          You reviewed {completed.length} of {total} cards.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>
          Card {currentIndex + 1} / {total}
        </p>
        <p>{progressPercent}% complete</p>
      </div>

      <div className="grid h-2 w-full grid-cols-12 gap-1 overflow-hidden rounded-full bg-slate-100 p-0.5">
        {Array.from({ length: 12 }, (_, i) => {
          const threshold = Math.ceil(((i + 1) / 12) * total);
          const active = completed.length >= threshold;
          return (
            <div
              key={i}
              className={`rounded-full transition-colors duration-300 ${
                active ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>

      <Flashcard
        topicId={currentCard.topicId}
        front={currentCard.front}
        back={currentCard.back}
        onReviewSaved={() => {
          setCompleted((prev) => [...prev, currentCard.id]);
          setCurrentIndex((prev) => prev + 1);
        }}
      />
    </section>
  );
}
