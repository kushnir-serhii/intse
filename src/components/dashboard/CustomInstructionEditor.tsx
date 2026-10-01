'use client';

import { useEffect, useRef, useState } from 'react';

import {
  CharCounter,
  type CharCounterState,
  getCharCounterState,
} from '@/components/chat/CharCounter';
import { MAX_CUSTOM_INSTRUCTION_LENGTH } from '@/lib/systemPrompt';
import { useSettingsStore } from '@/store/useSettingsStore';

interface CustomInstructionEditorProps {
  /** DOM id of the textarea, so the parent can focus it. */
  inputId: string;
  /** Called when clearing the text made the store fall back to the Default instruction. */
  onFallback?: () => void;
  /** Called on every text change, after the store is updated and before `onFallback`. */
  onChange?: (value: string) => void;
}

const SAVED_DELAY_MS = 800;

const BORDER_CLASS: Record<CharCounterState, string> = {
  normal: 'border-accent-700 focus:border-accent',
  warning: 'border-warning',
  limit: 'border-danger',
};

export default function CustomInstructionEditor({
  inputId,
  onFallback,
  onChange,
}: CustomInstructionEditorProps) {
  const id = inputId;
  const customPrompt = useSettingsStore((s) => s.customPrompt);
  const setCustomPrompt = useSettingsStore((s) => s.setCustomPrompt);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterId = `${id}-counter`;
  const counterState = getCharCounterState(customPrompt.length, MAX_CUSTOM_INSTRUCTION_LENGTH);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleChange = (value: string) => {
    const fellBack = setCustomPrompt(value);
    onChange?.(value);
    if (fellBack) onFallback?.();
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(true), SAVED_DELAY_MS);
  };

  return (
    <div>
      <textarea
        id={id}
        value={customPrompt}
        onChange={(e) => handleChange(e.target.value)}
        aria-describedby={counterId}
        maxLength={MAX_CUSTOM_INSTRUCTION_LENGTH}
        placeholder="e.g. Talk to me like a barista in a London café. Use British spelling."
        rows={4}
        className={`bg-bg text-ink focus:ring-accent custom-scrollbar w-full resize-y rounded-md border px-3 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-1 ${BORDER_CLASS[counterState]}`}
      />
      <div className="mt-1 flex items-center justify-between">
        <span aria-live="polite" className="text-xs text-neutral-500">
          {saved ? 'Saved' : ''}
        </span>
        <CharCounter
          id={counterId}
          count={customPrompt.length}
          max={MAX_CUSTOM_INSTRUCTION_LENGTH}
          alwaysShow
        />
      </div>
    </div>
  );
}
