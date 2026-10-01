'use client';

import { useState } from 'react';

import { useSettingsStore } from '@/store/useSettingsStore';

interface NamePromptProps {
  onDone: () => void;
}

export default function NamePrompt({ onDone }: NamePromptProps) {
  const [inputValue, setInputValue] = useState('');

  function handleConfirm() {
    useSettingsStore.getState().setVisitorName(inputValue.trim() || null);
    useSettingsStore.getState().markNamePromptSeen();
    onDone();
  }

  function handleSkip() {
    useSettingsStore.getState().setVisitorName(null);
    useSettingsStore.getState().markNamePromptSeen();
    onDone();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  }

  return (
    <div className="bg-bg fixed inset-0 z-50 flex flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-4">
        <h1 className="text-ink text-2xl font-[var(--font-inter)] font-bold">
          What&apos;s your name?
        </h1>

        <p className="text-sm font-[var(--font-inter)] font-normal text-neutral-500">
          We&apos;ll use it to greet you.
        </p>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your name"
          className="bg-surface text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-4 py-3 placeholder-neutral-500 outline-none focus:ring-1"
          autoFocus
        />

        <button
          type="button"
          onClick={handleConfirm}
          className="bg-accent w-full rounded-md px-4 py-3 font-[var(--font-inter)] font-semibold text-white hover:bg-[#388bfd] active:bg-[#1f6feb]"
        >
          Let&apos;s go
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="hover:text-ink text-sm font-[var(--font-inter)] text-neutral-500"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
