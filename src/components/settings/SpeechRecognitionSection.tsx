'use client';

import { useSyncExternalStore } from 'react';

import { isSpeechRecognitionSupported } from '@/hooks/useSpeechToText';
import { hasSpeechSupport, PRACTICE_LANGUAGE_NAMES } from '@/lib/languages';
import { selectMicLanguage, useSettingsStore } from '@/store/useSettingsStore';

const noopSubscribe = (): (() => void) => () => {};
const getServerSnapshot = (): boolean => true;

export function SpeechRecognitionSection() {
  const micLanguage = useSettingsStore((s) => s.micLanguage);
  const setMicLanguage = useSettingsStore((s) => s.setMicLanguage);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const resolvedMicLanguage = useSettingsStore(selectMicLanguage);

  // Server and hydration render as supported; the client re-reads after hydration.
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    isSpeechRecognitionSupported,
    getServerSnapshot,
  );

  const selectValue =
    micLanguage !== null && PRACTICE_LANGUAGE_NAMES.includes(micLanguage) ? micLanguage : '';

  return (
    <section className="bg-surface mb-8 rounded-lg border border-neutral-800 p-6">
      <h2 className="text-ink mb-1 text-base font-semibold">Speech Recognition</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Choose the language the microphone listens in.
      </p>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="mic-language" className="text-ink text-sm font-medium">
          Microphone language
        </label>
        <select
          id="mic-language"
          value={selectValue}
          disabled={!isSupported}
          onChange={(e) => setMicLanguage(e.target.value === '' ? null : e.target.value)}
          className="bg-bg text-ink focus:border-accent focus:ring-accent rounded-md border border-neutral-800 px-3 py-2 text-sm outline-none focus:ring-1"
        >
          <option value="">Same as practice language (currently: {targetLanguage})</option>
          {PRACTICE_LANGUAGE_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
              {hasSpeechSupport(name) ? '' : ' (listens in English for now)'}
            </option>
          ))}
        </select>
      </div>

      {!hasSpeechSupport(resolvedMicLanguage) && (
        <p className="mt-3 text-sm text-neutral-500">
          The microphone doesn&rsquo;t support {resolvedMicLanguage} yet, so it will listen in
          English.
        </p>
      )}

      {!isSupported && (
        <p className="mt-3 text-sm text-neutral-500">
          Speech recognition isn&rsquo;t supported in this browser.
        </p>
      )}
    </section>
  );
}
