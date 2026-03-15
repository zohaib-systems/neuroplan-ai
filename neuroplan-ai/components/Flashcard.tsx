"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";

type FlashcardProps = {
  front: string;
  back: string;
};

export default function Flashcard({ front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
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
  );
}
