'use client';

import { Fragment, useEffect, useRef } from 'react';

import { type Message, useChatStore } from '@/store/useChatStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';

import { DateDivider } from './DateDivider';
import { EmptyState } from './EmptyState';
import { MessageBubble } from './MessageBubble';
import { StreakChip } from './StreakChip';
import { TypingIndicator } from './TypingIndicator';

const STREAK_THRESHOLD = 3;

interface DayGroup {
  key: string;
  label: string;
  messages: Message[];
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date): string {
  const now = new Date();
  if (dayKey(d) === dayKey(now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

/**
 * Oldest day first, oldest message first within a day — stale messages
 * carried over from an earlier session must not land below today's. Array
 * sort is stable, so a reply stamped in the same ms as its question stays after it.
 */
function groupByDay(messages: Message[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const message of [...messages].sort((a, b) => a.timestamp - b.timestamp)) {
    const date = new Date(message.timestamp);
    const key = dayKey(date);
    const last = groups.at(-1);
    if (last?.key === key) last.messages.push(message);
    else groups.push({ key, label: dayLabel(date), messages: [message] });
  }
  return groups;
}

interface ChatThreadProps {
  repeat: (id: string, text: string) => void;
  ttsSpeed: number;
  onSpeedChange: (speed: number) => void;
  voices: SpeechSynthesisVoice[];
  onVoiceChange: (uri: string) => void;
  onPrompt?: (text: string) => void;
  /** Seed the composer from a correction card's "Say it back". */
  onSayItBack?: (text: string) => void;
}

export function ChatThread({
  repeat,
  ttsSpeed,
  onSpeedChange,
  voices,
  onVoiceChange,
  onPrompt,
  onSayItBack,
}: ChatThreadProps) {
  const messages = useChatStore((state) => state.messages);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const speakingMessageId = useChatStore((s) => s.speakingMessageId);
  const cleanStreak = useChatStore((s) => s.cleanStreak);
  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content)?.id;
  const ttsEnabled = useSettingsStore((state) => state.ttsEnabled);
  const selectedVoiceURI = useSettingsStore((state) => state.selectedVoiceURI);
  const deleteMessages = useChatStore((state) => state.deleteMessages);
  const openModal = useNotificationStore((s) => s.openModal);
  const bottomRef = useRef<HTMLDivElement>(null);
  const days = groupByDay(messages);

  // Auto-scroll on every new message or streaming chunk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function confirmDeleteDay(day: DayGroup) {
    const count = day.messages.filter((m) => m.content).length;
    openModal({
      title: 'Delete this day?',
      message: `${count} message${count === 1 ? '' : 's'} from ${day.label} will be removed from the chat. This can't be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => deleteMessages(day.messages.map((m) => m.id)),
    });
  }

  return (
    <div className="custom-scrollbar mx-auto flex min-h-0 w-full max-w-[680px] flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
      {messages.length === 0 ? (
        <EmptyState onPrompt={onPrompt} />
      ) : (
        days.map((day) => (
          <Fragment key={day.key}>
            <DateDivider label={day.label} onDelete={() => confirmDeleteDay(day)} />
            {day.messages.map((message) => {
              if (message.role === 'assistant' && message.content === '') {
                return message.isStreaming ? <TypingIndicator key={message.id} /> : null;
              }
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  role={message.role}
                  isSpeaking={speakingMessageId === message.id}
                  pleased={
                    message.role === 'assistant' &&
                    message.id === lastAssistantId &&
                    cleanStreak >= STREAK_THRESHOLD
                  }
                  onDelete={() => deleteMessage(message.id)}
                  ttsEnabled={ttsEnabled}
                  onRepeat={() => repeat(message.id, message.content)}
                  onSpeak={(text) => repeat(message.id, text)}
                  onSayItBack={onSayItBack}
                  ttsSpeed={ttsSpeed}
                  onSpeedChange={onSpeedChange}
                  voices={voices}
                  selectedVoiceURI={selectedVoiceURI}
                  onVoiceChange={onVoiceChange}
                />
              );
            })}
          </Fragment>
        ))
      )}
      {messages.length > 0 && cleanStreak >= STREAK_THRESHOLD && <StreakChip count={cleanStreak} />}
      <div ref={bottomRef} />
    </div>
  );
}
