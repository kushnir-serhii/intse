'use client';

import Link from 'next/link';
import { PiArrowUpRightBold } from 'react-icons/pi';

import { buildSystemPrompt } from '@/lib/systemPrompt';
import { selectIsCustomInUse, useSettingsStore } from '@/store/useSettingsStore';

/**
 * The "Prompt" tab of the coached session — the instruction the assistant
 * is running under, read-only here. The "Edit on Dashboard" link deep-links to
 * the Dashboard's AI instruction card (`#ai-instruction`) where it is edited.
 */
export function PromptView() {
  const customPrompt = useSettingsStore((s) => s.customPrompt);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const level = useSettingsStore((s) => s.level);
  const mode = useSettingsStore((s) => s.customPromptMode);
  const customInUse = useSettingsStore(selectIsCustomInUse);

  const active = buildSystemPrompt(
    targetLanguage,
    level,
    customInUse ? customPrompt : undefined,
    mode,
  );
  const hint =
    mode === 'append'
      ? 'Added to the default instruction. Your practice language and level always apply.'
      : 'Your practice language and level always apply.';

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-widest text-neutral-600 uppercase">
          Running prompt
        </span>
        <span className="text-[13px] text-neutral-500">
          {!customInUse ? 'Default' : mode === 'append' ? 'Default + mine' : 'Custom'} ·{' '}
          {targetLanguage} · {level}
        </span>
      </div>

      <div className="bg-surface rounded-xl border border-neutral-800 p-4 text-sm leading-relaxed whitespace-pre-wrap text-neutral-300">
        {active}
      </div>

      {customInUse ? <p className="text-[13px] text-neutral-500">{hint}</p> : null}

      <Link
        href="/dashboard#ai-instruction"
        className="hover:border-accent-700 hover:text-accent-200 flex h-[34px] items-center gap-1.5 self-start rounded-lg border border-neutral-800 px-3 text-[13px] text-neutral-300 transition-colors"
      >
        Edit on Dashboard
        <PiArrowUpRightBold className="text-[13px]" aria-hidden />
      </Link>
    </div>
  );
}
