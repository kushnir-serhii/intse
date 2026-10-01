'use client';

import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

import type { InstructionChoice } from '@/store/useSettingsStore';

export interface InstructionModeOption {
  id: InstructionChoice;
  label: string;
  /** Short formula shown under the label, e.g. "Built-in prompt, then your text". */
  formula: string;
}

interface InstructionModeSwitchProps {
  options: ReadonlyArray<InstructionModeOption>;
  value: InstructionChoice;
  onChange: (id: InstructionChoice) => void;
}

/** Segmented radiogroup choosing how the user's instruction fits into the system prompt. */
export default function InstructionModeSwitch({
  options,
  value,
  onChange,
}: InstructionModeSwitchProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = options.length;
    let next: number;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % count;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
      next = (index - 1 + count) % count;
    else return;
    event.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].id);
  };

  return (
    <div
      role="radiogroup"
      aria-label="How your instruction is used"
      className="bg-bg grid grid-cols-1 gap-1 rounded-lg border border-neutral-800 p-1 sm:grid-cols-3"
    >
      {options.map((option, index) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`focus-visible:ring-accent flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-md px-3 py-2 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              selected
                ? 'bg-accent-900 text-accent-200 ring-accent-700 ring-1 ring-inset'
                : 'hover:text-ink text-neutral-500'
            }`}
          >
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-xs opacity-80">{option.formula}</span>
          </button>
        );
      })}
    </div>
  );
}
