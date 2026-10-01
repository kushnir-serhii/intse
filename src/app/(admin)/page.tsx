'use client';

import { useCallback, useEffect, useState } from 'react';

import { ChatInput } from '@/components/chat/ChatInput';
import { ChatThread } from '@/components/chat/ChatThread';
import { PromptView } from '@/components/chat/PromptView';
import { SessionHeader, type SessionView } from '@/components/chat/SessionHeader';
import { TalkPanel } from '@/components/chat/TalkPanel';
import { LimitReachedModal } from '@/components/ui';
import { useTTS } from '@/hooks/useTTS';
import { useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

export default function ChatPage() {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [seedText, setSeedText] = useState<{ value: string } | null>(null);
  const [view, setView] = useState<SessionView>('chat');

  const dailyRequests = useUserStore((s) => s.dailyRequests);
  const dailyRequestLimit = useUserStore((s) => s.dailyRequestLimit);
  const visitorId = useUserStore((s) => s.visitorId);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const ttsEnabled = useSettingsStore((s) => s.ttsEnabled);
  const setTtsEnabled = useSettingsStore((s) => s.setTtsEnabled);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const setTtsSpeed = useSettingsStore((s) => s.setTtsSpeed);
  const setSelectedVoiceURI = useSettingsStore((s) => s.setSelectedVoiceURI);

  const messages = useChatStore((s) => s.messages);
  const sessionId = useChatStore((s) => s.sessionId);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setSessionSaved = useChatStore((s) => s.setSessionSaved);

  const addToast = useNotificationStore((s) => s.addToast);

  const handleNewConversation = useCallback(() => {
    if (messages.length === 0) return;
    setShowNewConvDialog(true);
  }, [messages.length]);

  const handleSave = useCallback(async () => {
    try {
      const payload = {
        sessionId,
        visitorId,
        messages: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
      };
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSessionSaved(true);
      clearMessages();
      setShowNewConvDialog(false);
    } catch {
      addToast('error', 'Could not save the conversation. Please try again.');
    }
  }, [sessionId, visitorId, messages, setSessionSaved, clearMessages, addToast]);

  const handleDiscard = useCallback(() => {
    clearMessages();
    setShowNewConvDialog(false);
  }, [clearMessages]);

  const handleSpeedChange = useCallback((speed: number) => setTtsSpeed(speed), [setTtsSpeed]);
  const handleVoiceChange = useCallback(
    (uri: string) => setSelectedVoiceURI(uri),
    [setSelectedVoiceURI],
  );

  const { isSupported, voices, speak, stop, repeat } = useTTS({ targetLanguage });

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const msUntilMidnight = tomorrow.getTime() - Date.now();

    const timerId = setTimeout(() => {
      const id = useUserStore.getState().visitorId;
      if (id === null) return;
      fetch(`/api/stats?visitorId=${id}`)
        .then((res) => res.json())
        .then(
          (data: {
            count: number;
            cap: number;
            dailyRequests: number;
            dailyRequestLimit: number;
          }) => {
            useUserStore
              .getState()
              .updateStats(data.count, data.cap, data.dailyRequests, data.dailyRequestLimit);
          },
        )
        .catch(() => {
          // Fail silently — the user will see updated limits on their next request
        });
    }, msUntilMidnight);

    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    useChatStore.getState().initSessionId();
  }, []);

  // Esc closes the new-conversation dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setShowNewConvDialog(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const role = useUserStore((s) => s.role);
  const isLimitReached = role === 'user' && dailyRequests > 0 && dailyRequests >= dailyRequestLimit;

  return (
    <div className="flex h-full max-h-screen">
      {/* Centre column — the mobile screen, at any width */}
      <div className="flex min-w-0 flex-1 flex-col">
        <SessionHeader
          view={view}
          onViewChange={setView}
          onEnd={handleNewConversation}
          ttsEnabled={ttsEnabled}
          onToggleTts={() => {
            const next = !ttsEnabled;
            setTtsEnabled(next);
            if (!next) stop();
          }}
        />

        {view === 'prompt' ? (
          <PromptView />
        ) : view === 'talk' ? (
          <TalkPanel onOpenThread={() => setView('chat')} />
        ) : (
          <ChatThread
            repeat={repeat}
            ttsSpeed={ttsSpeed}
            onSpeedChange={handleSpeedChange}
            voices={voices}
            onVoiceChange={handleVoiceChange}
            onPrompt={(t) => setSeedText({ value: t })}
            onSayItBack={(t) => setSeedText({ value: t })}
          />
        )}

        {view !== 'prompt' && (
          <ChatInput
            disabled={isLimitReached}
            onLimitReached={() => setShowLimitModal(true)}
            speak={speak}
            stop={stop}
            isSupported={isSupported}
            ttsEnabled={ttsEnabled}
            seedText={seedText}
          />
        )}
      </div>

      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      {showNewConvDialog && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50"
          onClick={() => setShowNewConvDialog(false)}
        >
          <div
            className="bg-surface mx-4 w-full max-w-sm rounded-[14px] border border-neutral-700 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-sm leading-relaxed text-neutral-400">
              Save this conversation before starting a new one?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewConvDialog(false)}
                className="text-ink rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="text-ink rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-900"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="border-accent bg-accent/10 text-accent-200 hover:bg-accent/18 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
