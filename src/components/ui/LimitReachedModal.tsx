'use client';

import { useState } from 'react';

import { useSettingsStore } from '@/store/useSettingsStore';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LimitReachedModal({ isOpen, onClose }: LimitReachedModalProps) {
  const [showKeyField, setShowKeyField] = useState(false);
  const [keyValue, setKeyValue] = useState('');

  if (!isOpen) return null;

  const handleEnterKey = () => {
    setShowKeyField(true);
  };

  const handleSaveKey = () => {
    useSettingsStore.getState().setApiKey(keyValue);
    onClose();
  };

  const handleCancel = () => {
    setShowKeyField(false);
    setKeyValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface mx-4 w-full max-w-sm rounded-xl border border-neutral-800 p-6">
        <p className="mb-6 text-sm leading-relaxed text-neutral-500">
          You&apos;ve reached today&apos;s limit. Come back tomorrow! You can also use your own key
          to continue.
        </p>

        {!showKeyField && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleEnterKey}
              className="text-ink rounded-lg border border-neutral-800 px-4 py-2 text-sm transition-colors hover:bg-neutral-900"
            >
              Enter your key
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-accent hover:bg-accent-400 rounded-lg px-4 py-2 text-sm text-white transition-colors"
            >
              OK
            </button>
          </div>
        )}

        {showKeyField && (
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-…"
              className="text-ink bg-bg focus:border-accent w-full rounded-lg border border-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 transition-colors focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="text-ink rounded-lg border border-neutral-800 px-4 py-2 text-sm transition-colors hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="bg-accent hover:bg-accent-400 rounded-lg px-4 py-2 text-sm text-white transition-colors"
              >
                Save key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
