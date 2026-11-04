'use client';

import { PiGaugeBold, PiSpeakerHighBold } from 'react-icons/pi';

import { MessageMenu } from './MessageMenu';

interface MessageActionsProps {
  content: string;
  role: 'user' | 'assistant';
  /** Send time (ms) — shown as HH:MM, full date on hover. */
  timestamp: number;
  onDelete: () => void;
  ttsEnabled: boolean;
  onRepeat: () => void;
  ttsSpeed: number;
  onSpeedChange: (speed: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onVoiceChange: (uri: string) => void;
}

const iconBtn =
  'grid h-7 w-7 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-accent-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

/**
 * Footer inside the bubble — play / slower on the left for replies, send
 * time and the overflow menu (copy, speed, voice, delete) on the right.
 */
export function MessageActions({
  content,
  role,
  timestamp,
  onDelete,
  ttsEnabled,
  onRepeat,
  ttsSpeed,
  onSpeedChange,
  voices,
  selectedVoiceURI,
  onVoiceChange,
}: MessageActionsProps) {
  const sentAt = new Date(timestamp);

  function handleSlower() {
    onSpeedChange(Math.max(0.5, Number((ttsSpeed - 0.25).toFixed(2))));
    onRepeat();
  }

  return (
    <div className="-mr-2 -mb-1.5 flex items-center gap-0.5">
      {role === 'assistant' && (
        <div className="-ml-1.5 flex items-center gap-0.5">
          <button type="button" aria-label="Play" className={iconBtn} onClick={onRepeat}>
            <PiSpeakerHighBold className="text-[15px]" />
          </button>
          <button type="button" aria-label="Slower" className={iconBtn} onClick={handleSlower}>
            <PiGaugeBold className="text-[15px]" />
          </button>
        </div>
      )}
      <time
        dateTime={sentAt.toISOString()}
        title={sentAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        className={`ml-auto pl-3 text-[11px] tabular-nums ${
          role === 'user' ? 'text-accent-300' : 'text-neutral-500'
        }`}
      >
        {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </time>
      <MessageMenu
        content={content}
        onDelete={onDelete}
        role={role}
        side="left"
        ttsEnabled={ttsEnabled}
        onRepeat={onRepeat}
        ttsSpeed={ttsSpeed}
        onSpeedChange={onSpeedChange}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={onVoiceChange}
      />
    </div>
  );
}
