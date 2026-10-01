'use client';

import { useState } from 'react';

import {
  buildLanguageFooter,
  buildLanguageLevelFrame,
  type CustomInstructionMode,
  DEFAULT_INSTRUCTION_BODY,
} from '@/lib/systemPrompt';
import type { InstructionChoice } from '@/store/useSettingsStore';
import { selectIsCustomInUse, useSettingsStore } from '@/store/useSettingsStore';

import CustomInstructionEditor from './CustomInstructionEditor';
import InstructionModeSwitch, { type InstructionModeOption } from './InstructionModeSwitch';
import PromptSection from './PromptSection';

const MODE_OPTIONS: ReadonlyArray<InstructionModeOption> = [
  { id: 'default', label: 'Default', formula: 'Built-in prompt only' },
  { id: 'append', label: 'Default + mine', formula: 'Built-in prompt, then your text' },
  { id: 'replace', label: 'Only mine', formula: 'Your text instead of coaching' },
];

const MODE_HELP: Record<InstructionChoice, string> = {
  default: 'The AI uses the built-in prompt shown below. Your saved text is kept but not sent.',
  append: 'The built-in coaching style stays, and your instruction is added after it.',
  replace: 'Your instruction replaces the coaching style. Language and level rules still apply.',
};

const EDITOR_ID = 'custom-instruction-input';

type InstructionNote = 'reset' | 'empty' | 'pending';

const NOTE_TEXT: Record<InstructionNote, string> = {
  reset: 'Default instruction in use. Your instruction is kept.',
  empty: 'Your instruction is empty — the default is used until you type.',
  pending: 'Write your instruction — the default is used until you do.',
};

const LEGEND = [
  { id: 'locked', label: 'Locked', swatch: 'bg-neutral-700' },
  { id: 'yours', label: 'Yours', swatch: 'bg-accent' },
] as const;

export default function PromptCard() {
  const customPrompt = useSettingsStore((s) => s.customPrompt);
  const mode = useSettingsStore((s) => s.customPromptMode);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const level = useSettingsStore((s) => s.level);
  const isCustomInUse = useSettingsStore(selectIsCustomInUse);
  const selectInstruction = useSettingsStore((s) => s.selectInstruction);
  const resetToDefault = useSettingsStore((s) => s.resetToDefault);
  const [note, setNote] = useState<InstructionNote | null>(null);
  /** A custom mode picked while the text is blank: shows the editor, applied on first text. */
  const [pendingMode, setPendingMode] = useState<CustomInstructionMode | null>(null);

  const isCustomBlank = customPrompt.trim().length === 0;
  const viewMode: InstructionChoice = isCustomInUse ? mode : (pendingMode ?? 'default');

  const focusEditor = () => {
    // Wait for the editor to mount when switching from Default.
    requestAnimationFrame(() => document.getElementById(EDITOR_ID)?.focus());
  };

  const handleModeChange = (id: InstructionChoice) => {
    if (id === 'default') {
      setPendingMode(null);
      setNote(null);
      selectInstruction('default');
      return;
    }
    if (isCustomBlank) {
      setPendingMode(id);
      setNote('pending');
      focusEditor();
      return;
    }
    setPendingMode(null);
    setNote(null);
    selectInstruction(id);
  };

  const handleTextChange = (value: string) => {
    setNote(null);
    if (pendingMode && value.trim().length > 0) {
      selectInstruction(pendingMode);
      setPendingMode(null);
    }
  };

  const handleFallback = () => {
    // Keep the editor open so the user can retype; the default applies meanwhile.
    setPendingMode(mode);
    setNote('empty');
  };

  const handleResetToDefault = () => {
    setPendingMode(null);
    resetToDefault();
    setNote('reset');
  };

  return (
    <section
      id="ai-instruction"
      className="bg-surface flex scroll-mt-6 flex-col gap-5 rounded-lg border border-neutral-800 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="ai-instruction-heading" className="text-ink text-base font-semibold">
            AI Instruction
          </h2>
          <p className="text-sm text-neutral-500">
            This is the full prompt the AI receives before every message. Choose how your own text
            fits in.
          </p>
        </div>
        {viewMode !== 'default' && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-accent-200 hover:text-ink focus:ring-accent shrink-0 rounded-md border border-neutral-800 px-3 py-1.5 text-sm transition-colors focus:ring-2"
          >
            Reset to default
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <InstructionModeSwitch
          options={MODE_OPTIONS}
          value={viewMode}
          onChange={handleModeChange}
        />
        <p className="text-sm text-neutral-500">{MODE_HELP[viewMode]}</p>
      </div>

      <div className="bg-bg overflow-hidden rounded-lg border border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 px-4 py-2.5">
          <span className="text-xs font-semibold tracking-[0.08em] text-neutral-500 uppercase">
            System prompt · {targetLanguage} · {level}
          </span>
          <span className="flex gap-3.5 text-xs text-neutral-500">
            {LEGEND.map((item) => (
              <span key={item.id} className="flex items-center gap-1.5">
                <span aria-hidden className={`size-2 rounded-xs ${item.swatch}`} />
                {item.label}
              </span>
            ))}
          </span>
        </div>

        <PromptSection label="Language & level" sublabel="Set in the cards above" tone="locked">
          <p className="text-sm leading-relaxed text-neutral-500">
            {buildLanguageLevelFrame(targetLanguage, level)}
          </p>
        </PromptSection>

        {viewMode === 'replace' ? (
          <PromptSection label="Coaching style" tone="replaced">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-neutral-500">
                Not sent — replaced by your instruction below.
              </span>
              <button
                type="button"
                onClick={() => handleModeChange('append')}
                className="text-accent-400 hover:text-accent-200 focus:ring-accent rounded-md border border-neutral-800 px-2.5 py-1 text-xs font-medium transition-colors focus:ring-2"
              >
                Keep it instead
              </button>
            </div>
          </PromptSection>
        ) : (
          <PromptSection label="Coaching style" sublabel="Built-in default" tone="locked">
            <p className="text-sm leading-relaxed text-neutral-400">{DEFAULT_INSTRUCTION_BODY}</p>
          </PromptSection>
        )}

        {viewMode === 'default' ? (
          <PromptSection label="Your instruction" tone="muted">
            <button
              type="button"
              onClick={() => handleModeChange('append')}
              className="hover:border-accent-700 focus:ring-accent flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-dashed border-neutral-700 px-3.5 text-left text-sm text-neutral-400 transition-colors focus:ring-2"
            >
              <span>
                {isCustomBlank
                  ? 'Add your own topics, tone or role-play.'
                  : 'Your saved instruction is not sent right now.'}
              </span>
              <span className="text-accent-400 shrink-0 font-medium">+ Add to prompt</span>
            </button>
          </PromptSection>
        ) : (
          <PromptSection
            label="Your instruction"
            sublabel={
              viewMode === 'replace'
                ? 'Sent instead of the coaching style'
                : 'Added after the coaching style'
            }
            tone="yours"
            htmlFor={EDITOR_ID}
          >
            <CustomInstructionEditor
              inputId={EDITOR_ID}
              onChange={handleTextChange}
              onFallback={handleFallback}
            />
          </PromptSection>
        )}

        <PromptSection label="Language rule" tone="locked">
          <p className="text-sm leading-relaxed text-neutral-500">
            {buildLanguageFooter(targetLanguage)}
          </p>
        </PromptSection>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-neutral-500">
        {note
          ? NOTE_TEXT[note]
          : 'Locked parts always apply and update when you change language or level.'}
      </p>
    </section>
  );
}
