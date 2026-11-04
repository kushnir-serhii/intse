'use client';

import { IntseMark } from '@/components/ui';
import type { Message } from '@/store/useChatStore';

import { CorrectionCard } from './CorrectionCard';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  role: Message['role'];
  isSpeaking?: boolean;
  /** Latest assistant turn while the user is on a clean streak (design 1e). */
  pleased?: boolean;
  onDelete: () => void;
  ttsEnabled?: boolean;
  onRepeat?: () => void;
  onSpeak?: (text: string) => void;
  /** Seed the composer with a phrase (correction card "Say it back"). */
  onSayItBack?: (text: string) => void;
  ttsSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  voices?: SpeechSynthesisVoice[];
  selectedVoiceURI?: string | null;
  onVoiceChange?: (uri: string) => void;
}

export function MessageBubble({
  message,
  isSpeaking = false,
  pleased = false,
  onDelete,
  ttsEnabled = false,
  onRepeat = () => {},
  onSpeak = () => {},
  onSayItBack = () => {},
  ttsSpeed = 1,
  onSpeedChange = () => {},
  voices = [],
  selectedVoiceURI = null,
  onVoiceChange = () => {},
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="animate-message-in border-accent-700 bg-accent-900 text-accent-100 flex max-w-[78%] flex-col gap-1 rounded-[14px_14px_4px_14px] border px-3.5 py-2.5 text-[15px] leading-relaxed">
          <span className="wrap-break-word whitespace-pre-wrap">{message.content}</span>
          <MessageActions
            content={message.content}
            role="user"
            timestamp={message.timestamp}
            onDelete={onDelete}
            ttsEnabled={ttsEnabled}
            onRepeat={onRepeat}
            ttsSpeed={ttsSpeed}
            onSpeedChange={onSpeedChange}
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={onVoiceChange}
          />
        </div>
        {message.correction ? (
          <CorrectionCard
            original={message.content}
            suggestion={message.correction}
            note={message.correctionNote}
            onHear={() => onSpeak(message.correction!)}
            onSayItBack={onSayItBack}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="animate-message-in mr-auto flex items-start gap-2.5">
      <span
        className={`mt-0.5 shrink-0 ${
          isSpeaking || pleased ? 'text-accent-200' : 'text-accent-400'
        }`}
      >
        <IntseMark size={26} state={isSpeaking ? 'listening' : pleased ? 'pleased' : 'idle'} />
      </span>
      <div
        className={`bg-surface text-ink flex max-w-[300px] flex-col gap-1 rounded-[14px_14px_14px_4px] border px-3.5 py-2.5 text-[15px] leading-relaxed transition-colors ${
          isSpeaking ? 'border-accent' : 'border-neutral-800'
        }`}
      >
        <span className="wrap-break-word whitespace-pre-wrap">{message.content}</span>
        {!message.isStreaming && message.content ? (
          <MessageActions
            content={message.content}
            role="assistant"
            timestamp={message.timestamp}
            onDelete={onDelete}
            ttsEnabled={ttsEnabled}
            onRepeat={onRepeat}
            ttsSpeed={ttsSpeed}
            onSpeedChange={onSpeedChange}
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={onVoiceChange}
          />
        ) : null}
      </div>
    </div>
  );
}
