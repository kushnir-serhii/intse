import type { ReactNode } from 'react';
import { PiLockSimpleBold, PiPencilSimpleBold } from 'react-icons/pi';

type PromptSectionTone = 'locked' | 'yours' | 'muted' | 'replaced';

interface PromptSectionProps {
  label: string;
  /** Small line under the label (e.g. "Built-in default"). */
  sublabel?: ReactNode;
  tone: PromptSectionTone;
  /** Renders the label as a <label> for this input id. */
  htmlFor?: string;
  children: ReactNode;
}

const ROW_CLASS: Record<PromptSectionTone, string> = {
  locked: '',
  yours: 'bg-accent-900/40',
  muted: '',
  replaced: 'bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgb(63_66_77/0.25)_8px_9px)]',
};

const LABEL_CLASS: Record<PromptSectionTone, string> = {
  locked: 'text-neutral-400',
  yours: 'text-accent-200',
  muted: 'text-neutral-600',
  replaced: 'text-neutral-600 line-through',
};

/** One labelled part of the system prompt, shown as a row in the prompt composer. */
export default function PromptSection({
  label,
  sublabel,
  tone,
  htmlFor,
  children,
}: PromptSectionProps) {
  const LabelTag = htmlFor ? 'label' : 'span';
  const icon =
    tone === 'locked' ? (
      <PiLockSimpleBold aria-hidden className="shrink-0 text-xs" />
    ) : tone === 'yours' ? (
      <PiPencilSimpleBold aria-hidden className="shrink-0 text-xs" />
    ) : null;

  return (
    <div
      className={`grid grid-cols-1 border-b border-neutral-900 last:border-b-0 sm:grid-cols-[168px_minmax(0,1fr)] ${ROW_CLASS[tone]}`}
    >
      <div className="flex flex-col gap-1 px-4 pt-4 sm:pb-4">
        <LabelTag
          htmlFor={htmlFor}
          className={`flex items-center gap-1.5 text-xs font-semibold ${LABEL_CLASS[tone]}`}
        >
          {icon}
          {label}
        </LabelTag>
        {sublabel ? <span className="text-xs text-neutral-500">{sublabel}</span> : null}
      </div>
      <div className="px-4 py-3 sm:py-3 sm:pl-0">{children}</div>
    </div>
  );
}
