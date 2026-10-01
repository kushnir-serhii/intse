import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type CustomInstructionMode, MAX_CUSTOM_INSTRUCTION_LENGTH } from '@/lib/systemPrompt';

type Theme = 'dark' | 'light';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** 'default' = default only; 'append' = default + mine; 'replace' = only mine. */
export type InstructionChoice = 'default' | CustomInstructionMode;

interface SettingsState {
  theme: Theme;
  targetLanguage: string;
  level: CefrLevel;
  visitorName: string | null;
  hasSeenNamePrompt: boolean;
  apiKey: string;
  ttsEnabled: boolean;
  selectedVoiceURI: string | null;
  /** Microphone language; null means follow the practice language. */
  micLanguage: string | null;
  setMicLanguage: (lang: string | null) => void;
  toggleTheme: () => void;
  setVisitorName: (name: string | null) => void;
  markNamePromptSeen: () => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  setTtsEnabled: (v: boolean) => void;
  setSelectedVoiceURI: (uri: string | null) => void;
  setTargetLanguage: (lang: string) => void;
  setLevel: (level: CefrLevel) => void;
  ttsSpeed: number;
  setTtsSpeed: (speed: number) => void;
  customPrompt: string;
  useCustomPrompt: boolean;
  customPromptMode: CustomInstructionMode;
  setCustomPromptMode: (mode: CustomInstructionMode) => void;
  /**
   * Clamps the text; returns true when a blank text made the store fall back to Default.
   * The first non-blank text typed while Default is in use switches to "Default + mine".
   */
  setCustomPrompt: (prompt: string) => boolean;
  /** 'append' / 'replace' are no-ops while the custom text is blank. */
  selectInstruction: (choice: InstructionChoice) => void;
  /** Switches back to Default; never touches customPrompt. */
  resetToDefault: () => void;
}

/** The only source of truth for "is the custom instruction actually in use". */
export const selectIsCustomInUse = (
  state: Pick<SettingsState, 'customPrompt' | 'useCustomPrompt'>,
): boolean => state.useCustomPrompt && state.customPrompt.trim().length > 0;

/** Resolved microphone language: the chosen one, or the practice language. */
export const selectMicLanguage = (
  state: Pick<SettingsState, 'micLanguage' | 'targetLanguage'>,
): string => state.micLanguage ?? state.targetLanguage;

const clampInstruction = (text: string): string => text.slice(0, MAX_CUSTOM_INSTRUCTION_LENGTH);

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      targetLanguage: 'English',
      level: 'B1',
      visitorName: null,
      hasSeenNamePrompt: false,
      apiKey: '',
      ttsEnabled: true,
      selectedVoiceURI: null,
      micLanguage: null,
      setMicLanguage: (lang: string | null) => set({ micLanguage: lang }),
      ttsSpeed: 1,
      toggleTheme: () => {
        const nextTheme: Theme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: nextTheme });
        if (typeof window !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setVisitorName: (name: string | null) => {
        set({ visitorName: name });
      },
      markNamePromptSeen: () => {
        set({ hasSeenNamePrompt: true });
      },
      setApiKey: (key: string) => {
        set({ apiKey: key });
      },
      clearApiKey: () => {
        set({ apiKey: '' });
      },
      setTtsEnabled: (v: boolean) => {
        set({ ttsEnabled: v });
      },
      setSelectedVoiceURI: (uri: string | null) => {
        set({ selectedVoiceURI: uri });
      },
      setTargetLanguage: (lang: string) => {
        set({ targetLanguage: lang, selectedVoiceURI: null });
      },
      setLevel: (level: CefrLevel) => {
        set({ level });
      },
      setTtsSpeed: (speed: number) => set({ ttsSpeed: Math.min(2.0, Math.max(0.5, speed)) }),
      customPrompt: '',
      useCustomPrompt: false,
      customPromptMode: 'append',
      setCustomPromptMode: (mode: CustomInstructionMode) => set({ customPromptMode: mode }),
      setCustomPrompt: (prompt: string) => {
        const customPrompt = clampInstruction(prompt);
        const { useCustomPrompt, customPrompt: previous } = get();
        const isBlank = customPrompt.trim().length === 0;
        const fellBack = useCustomPrompt && isBlank;
        const firstText = !useCustomPrompt && previous.trim().length === 0 && !isBlank;
        if (fellBack) set({ customPrompt, useCustomPrompt: false });
        else if (firstText)
          set({ customPrompt, useCustomPrompt: true, customPromptMode: 'append' });
        else set({ customPrompt });
        return fellBack;
      },
      selectInstruction: (choice: InstructionChoice) => {
        if (choice === 'default') {
          set({ useCustomPrompt: false });
          return;
        }
        if (get().customPrompt.trim().length === 0) return;
        set({ useCustomPrompt: true, customPromptMode: choice });
      },
      resetToDefault: () => set({ useCustomPrompt: false }),
    }),
    {
      name: 'intse-settings',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (typeof persistedState !== 'object' || persistedState === null) {
          return persistedState as SettingsState;
        }
        const state = { ...(persistedState as Record<string, unknown>) };
        if (version < 1) {
          const rawPrompt = typeof state.customPrompt === 'string' ? state.customPrompt : '';
          const customPrompt = clampInstruction(rawPrompt);
          state.customPrompt = customPrompt;
          if (customPrompt.trim().length === 0) state.useCustomPrompt = false;
        }
        // Before v2 a custom instruction always replaced the default body.
        if (version < 2) state.customPromptMode = 'replace';
        return state as unknown as SettingsState;
      },
    },
  ),
);
