// lib/sm2.ts
export interface SM2Input {
  quality: number;      // 0-5 (0=forgot, 5=perfect)
  prevInterval: number; // days
  prevEF: number;       // Easiness Factor
  repetitions: number;  // successful attempts
}

export function calculateSM2({ quality, prevInterval, prevEF, repetitions }: SM2Input) {
  let interval: number;
  let ef: number;
  let nextRepetitions: number;

  if (quality < 3) {
    // Failure: Start over
    interval = 1;
    ef = prevEF;
    nextRepetitions = 0;
  } else {
    // Success: Expand the gap
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEF);
    }

    // New EF Formula
    ef = prevEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ef < 1.3) ef = 1.3;
    nextRepetitions = repetitions + 1;
  }

  return { interval, easinessFactor: ef, repetitions: nextRepetitions };
}