"use client";

import { SCALE_LABELS } from "@/data/survey";

interface RatingScaleProps {
  value?: number;
  onChange: (value: number) => void;
  name: string;
}

export default function RatingScale({
  value,
  onChange,
  name,
}: RatingScaleProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((score) => {
        const active = value === score;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={active}
            title={SCALE_LABELS[score]}
            onClick={() => onChange(score)}
            className={`flex h-10 min-w-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-white/25 bg-white/5 text-white/80 hover:border-accent hover:text-accent"
            }`}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}
