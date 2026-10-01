'use client';

import type { ReactElement } from 'react';

import { CEFR_LEVELS, useSettingsStore } from '@/store/useSettingsStore';

export function LevelCard(): ReactElement {
  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);

  return (
    <section className="bg-surface rounded-lg border border-neutral-800 p-6">
      <h2 className="text-ink mb-1 text-base font-semibold">Level</h2>
      <p className="mb-4 text-sm text-neutral-500">
        How challenging the AI&rsquo;s language should be (CEFR).
      </p>
      <div className="grid max-w-sm grid-cols-6 gap-1 rounded-[11px] bg-neutral-900 p-1">
        {CEFR_LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            aria-pressed={level === l}
            className={`grid h-9 place-items-center rounded-lg text-sm transition-colors ${
              level === l
                ? 'border-accent-800 bg-surface text-accent-100 border'
                : 'hover:text-ink text-neutral-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </section>
  );
}
