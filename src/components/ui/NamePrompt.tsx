'use client';

import { useState } from 'react';

import OwnerLoginForm from '@/components/ui/OwnerLoginForm';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

interface NamePromptProps {
  onDone: () => void;
}

export default function NamePrompt({ onDone }: NamePromptProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [step, setStep] = useState<'name' | 'owner'>('name');

  function finish(name: string | null) {
    useSettingsStore.getState().setVisitorName(name);
    useSettingsStore.getState().markNamePromptSeen();
    onDone();
  }

  function handleConfirm() {
    if (isOwner) {
      setStep('owner');
      return;
    }
    finish(inputValue.trim() || null);
  }

  function handleSkip() {
    finish(null);
  }

  function handleOwnerSuccess(username: string, role: string) {
    useUserStore.getState().setRoleFromApi(role);
    // Named users use their username as visitorId (matches EnrollmentGate)
    useUserStore.getState().setVisitorId(username);
    finish(inputValue.trim() || null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  }

  return (
    <div className="bg-bg fixed inset-0 z-50 flex flex-col items-center justify-center px-4">
      {step === 'owner' ? (
        <OwnerLoginForm onSuccess={handleOwnerSuccess} onBack={() => setStep('name')} />
      ) : (
        <div className="flex w-full max-w-[400px] flex-col items-center gap-4">
          <h1 className="text-ink text-2xl font-bold">What&apos;s your name?</h1>

          <p className="text-sm font-normal text-neutral-500">We&apos;ll use it to greet you.</p>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your name"
            className="bg-surface text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-4 py-3 placeholder-neutral-500 outline-none focus:ring-1"
            autoFocus
          />

          <label className="text-ink flex w-full items-center gap-2 text-sm font-(--font-inter)">
            <input
              type="checkbox"
              checked={isOwner}
              onChange={(e) => setIsOwner(e.target.checked)}
              className="accent-accent size-4"
            />
            Owner
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            className="bg-accent w-full rounded-md px-4 py-3 font-semibold text-white hover:bg-[#388bfd] active:bg-[#1f6feb]"
          >
            Let&apos;s go
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="hover:text-ink text-sm font-(--font-inter) text-neutral-500"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
