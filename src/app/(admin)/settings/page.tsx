'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SpeechRecognitionSection } from '@/components/settings/SpeechRecognitionSection';
import { Toggle } from '@/components/ui/Toggle';
import { useNotification } from '@/hooks/useNotification';
import { useTTS } from '@/hooks/useTTS';
import { hasSpeechSupport } from '@/lib/languages';
import { useChatStore } from '@/store/useChatStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsPage() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);
  const ttsEnabled = useSettingsStore((s) => s.ttsEnabled);
  const setTtsEnabled = useSettingsStore((s) => s.setTtsEnabled);
  const selectedVoiceURI = useSettingsStore((s) => s.selectedVoiceURI);
  const setSelectedVoiceURI = useSettingsStore((s) => s.setSelectedVoiceURI);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const sessionTokens = useChatStore((s) => s.sessionTokens);
  const { toast } = useNotification();

  const { isSupported, voices } = useTTS({ targetLanguage });

  const [inputValue, setInputValue] = useState<string>(apiKey);

  function handleSave(): void {
    setApiKey(inputValue);
    toast('info', 'API key saved.');
  }

  function handleRemove(): void {
    clearApiKey();
    setInputValue('');
    toast('info', 'API key removed.');
  }

  return (
    <div className="custom-scrollbar bg-bg flex flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8">
      <h1 className="text-ink mb-8 font-[--font-inter] text-2xl font-bold">Settings</h1>

      <p className="mb-8 text-sm text-neutral-500">
        Practice language, level and AI instruction are on the{' '}
        <Link href="/dashboard" className="hover:text-ink font-semibold underline">
          Dashboard
        </Link>
        .
      </p>

      {/* Your AI Key */}
      <section className="bg-surface mb-8 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-ink mb-1 text-base font-semibold">Your AI Key</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Paste your own OpenAI API key to remove daily message limits.
        </p>

        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="sk-..."
          className="bg-bg text-ink focus:border-accent focus:ring-accent mb-3 w-full rounded-md border border-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-1"
        />

        {apiKey !== '' && (
          <p className="mb-4 text-sm text-neutral-500">
            Tokens used this session:{' '}
            <span className="font-(--font-jetbrains-mono)">{sessionTokens}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="bg-accent hover:bg-accent/80 focus:ring-accent focus:ring-offset-surface rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Save
          </button>

          {apiKey !== '' && (
            <button
              type="button"
              onClick={handleRemove}
              className="focus:ring-offset-surface rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-500 hover:border-red-500 hover:text-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
            >
              Remove key
            </button>
          )}
        </div>
      </section>

      {/* Appearance (placeholder) */}
      <section className="bg-surface mb-8 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-ink text-base font-semibold">Appearance</h2>
      </section>

      {/* Text to Speech */}
      <section className="bg-surface mb-8 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-ink mb-1 text-base font-semibold">Text to Speech</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Automatically read AI responses aloud after they finish streaming.
        </p>

        {/* Enable auto-play row */}
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="tts-enabled" className="text-ink text-sm font-medium">
            Enable auto-play
          </label>
          <Toggle id="tts-enabled" checked={ttsEnabled} onChange={setTtsEnabled} />
        </div>

        {/* Voice selector — always visible when supported and voices are available */}
        {isSupported && voices.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="tts-voice" className="text-ink text-sm font-medium">
              Voice
            </label>
            <select
              id="tts-voice"
              value={selectedVoiceURI ?? ''}
              onChange={(e) => setSelectedVoiceURI(e.target.value || null)}
              className="bg-bg text-ink focus:border-accent focus:ring-accent rounded-md border border-neutral-800 px-3 py-2 text-sm outline-none focus:ring-1"
            >
              <option value="">Default (system)</option>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!hasSpeechSupport(targetLanguage) && (
          <p className="mt-3 text-sm text-neutral-500">
            Voices for {targetLanguage} aren&rsquo;t supported yet, so English voices are shown.
          </p>
        )}

        {/* Unsupported notice */}
        {!isSupported && (
          <p className="text-sm text-neutral-500">
            Text-to-speech is not supported in this browser.
          </p>
        )}
      </section>

      <SpeechRecognitionSection />
    </div>
  );
}
