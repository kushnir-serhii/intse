'use client';

import { useEffect, useState } from 'react';
import { PiSpeakerHighBold, PiSpeakerSlashBold } from 'react-icons/pi';

import { useChatStore } from '@/store/useChatStore';
import { selectIsCustomInUse, useSettingsStore } from '@/store/useSettingsStore';

export type SessionView = 'chat' | 'talk' | 'prompt';

const VIEWS: { id: SessionView; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'talk', label: 'Talk' },
  { id: 'prompt', label: 'Prompt' },
];

/** Soft target the header progress ring fills toward (design doc 1c). */
const TURN_TARGET = 12;
const RING_CIRCUMFERENCE = 2 * Math.PI * 16;

interface SessionHeaderProps {
  view: SessionView;
  onViewChange: (v: SessionView) => void;
  onEnd: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
}

/**
 * The session spine (design doc 1c): a scenario, a level, a visible
 * progress ring and a way to end — then Chat / Talk / Prompt tabs.
 */
export function SessionHeader({
  view,
  onViewChange,
  onEnd,
  ttsEnabled,
  onToggleTts,
}: SessionHeaderProps) {
  const messages = useChatStore((s) => s.messages);
  const startedAt = useChatStore((s) => s.startedAt);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const level = useSettingsStore((s) => s.level);
  const isCustomInUse = useSettingsStore(selectIsCustomInUse);

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const hasSession = messages.length > 0;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setNow(Date.now());
    // Refresh asynchronously right away, then every 30s
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [startedAt]);
  const elapsedMin = startedAt ? Math.max(0, Math.floor((now - startedAt) / 60000)) : 0;

  const progress = Math.min(1, userTurns / TURN_TARGET);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const title = isCustomInUse ? 'Custom practice' : 'Free conversation';

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-none flex-col gap-3 px-4 pt-1 pb-3">
      <div className="flex items-center gap-3">
        <div className="relative grid h-11 w-11 flex-none place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="var(--color-neutral-900)"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <span className="text-accent-200 text-xs tabular-nums">{elapsedMin}&prime;</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-heading text-ink text-[17px] font-medium">{title}</span>
          <span className="truncate text-xs text-neutral-500">
            {targetLanguage} · {level} · {userTurns} {userTurns === 1 ? 'turn' : 'turns'}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleTts}
          aria-label={ttsEnabled ? 'Mute replies' : 'Read replies aloud'}
          aria-pressed={ttsEnabled}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
            ttsEnabled ? 'text-accent-200' : 'hover:text-ink text-neutral-500 hover:bg-neutral-900'
          }`}
        >
          {ttsEnabled ? (
            <PiSpeakerHighBold className="text-lg" />
          ) : (
            <PiSpeakerSlashBold className="text-lg" />
          )}
        </button>

        <button
          type="button"
          disabled={!hasSession}
          onClick={onEnd}
          className="hover:border-accent-700 hover:text-accent-200 h-9 rounded-lg border border-neutral-800 px-3 text-[13px] text-neutral-300 transition-colors disabled:opacity-40"
        >
          End
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Session view"
        className="grid grid-cols-3 gap-1 rounded-[11px] bg-neutral-900 p-1"
      >
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onViewChange(v.id)}
              className={`grid h-[34px] place-items-center rounded-lg text-[13px] transition-colors ${
                active
                  ? 'border-accent-800 bg-surface text-accent-100 border'
                  : 'hover:text-ink text-neutral-400'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
