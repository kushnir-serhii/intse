import type { SessionView } from './SessionHeader';

/** Short explanations shown in tooltips across the chat screen. */
export const TOOLTIP_COPY = {
  timer: 'Minutes since this session started. The ring fills as you take turns (goal: 12).',
  titleFree: 'Free conversation: chat about anything, no set scenario.',
  titleCustom: 'Custom practice: the tutor is following your own instruction from the Dashboard.',
  language: 'The language you are practicing.',
  level: 'Your CEFR level. The tutor keeps its vocabulary and grammar at this level.',
  turns: 'How many messages you have sent in this session.',
  ttsOn: 'Replies are read aloud. Tap to mute.',
  ttsOff: 'Tap to have replies read aloud.',
  end: 'Finish this conversation. You can save it to History or discard it, then start fresh.',
  autoDialog:
    'Hands-free mode: your speech is sent automatically, the tutor replies, and the mic reopens. Turn it off to type again.',
  left: 'Messages left today on the shared key. The limit resets at midnight UTC.',
  micIdle: 'Tap and speak. Your words appear in the box, ready to send.',
  micListening: 'Listening… speak now. Your words appear in the box.',
  send: 'Send your message (Enter).',
} as const;

export const VIEW_TOOLTIPS: Record<SessionView, string> = {
  chat: 'Type and read the conversation. Grammar fixes show up under your messages.',
  talk: 'Hands-free voice conversation: speak, and the tutor answers back.',
  prompt: 'See the instruction the tutor is running under. Edit it on the Dashboard.',
};

/** Quick-reply chips only drop their text into the composer; you still hit send. */
export const CHIP_TOOLTIPS: Record<string, string> = {
  'Ask me a question': 'Fills the box so the tutor asks you a question to get you talking.',
  'Say it slower': 'Fills the box to ask the tutor to repeat in simpler, slower wording.',
  'Explain that': 'Fills the box to ask the tutor to explain its last reply.',
  Explain: 'Fills the box to ask the tutor to explain its last reply.',
};
