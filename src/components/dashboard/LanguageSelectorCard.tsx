'use client';

import { type ReactElement, useCallback, useState } from 'react';

import { PRACTICE_LANGUAGE_NAMES } from '@/lib/languages';
import { useChatStore } from '@/store/useChatStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

export function LanguageSelectorCard(): ReactElement {
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const setTargetLanguage = useSettingsStore((s) => s.setTargetLanguage);

  const messages = useChatStore((s) => s.messages);
  const sessionId = useChatStore((s) => s.sessionId);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const initSessionId = useChatStore((s) => s.initSessionId);

  const visitorId = useUserStore((s) => s.visitorId);

  const [search, setSearch] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const filteredLanguages =
    search.trim() === ''
      ? PRACTICE_LANGUAGE_NAMES
      : PRACTICE_LANGUAGE_NAMES.filter((lang) =>
          lang.toLowerCase().includes(search.trim().toLowerCase()),
        );

  const handleOpen = useCallback((): void => {
    setSearch('');
    setIsOpen(true);
  }, []);

  const handleClose = useCallback((): void => {
    setIsOpen(false);
    setSearch('');
  }, []);

  const handleSelect = useCallback(
    async (lang: string): Promise<void> => {
      setIsOpen(false);
      setSearch('');

      if (lang === targetLanguage) return;

      if (messages.length > 0) {
        setIsSaving(true);
        try {
          await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, visitorId, messages }),
          });
        } catch {
          // Silently swallow network errors
        } finally {
          setIsSaving(false);
        }
      }

      setTargetLanguage(lang);
      clearMessages();
      initSessionId();
    },
    [
      targetLanguage,
      messages,
      sessionId,
      visitorId,
      setTargetLanguage,
      clearMessages,
      initSessionId,
    ],
  );

  return (
    <section className="bg-surface rounded-lg border border-neutral-800 p-6">
      <h2 className="text-ink mb-1 text-base font-semibold">Practice language</h2>
      <p className="mb-4 text-sm text-neutral-500">The language the AI talks to you in.</p>

      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : targetLanguage}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleOpen}
          onBlur={handleClose}
          placeholder="Search language…"
          disabled={isSaving}
          className="bg-bg text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-1 disabled:opacity-50"
        />

        {isSaving && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-neutral-500">
            Saving…
          </span>
        )}

        {isOpen && filteredLanguages.length > 0 && (
          <ul className="bg-surface absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-neutral-800 py-1 shadow-lg">
            {filteredLanguages.map((lang) => (
              <li key={lang}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    void handleSelect(lang);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-900 ${
                    lang === targetLanguage ? 'text-accent font-semibold' : 'text-ink'
                  }`}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
