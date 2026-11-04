'use client';

import { PiTrashBold } from 'react-icons/pi';

interface DateDividerProps {
  /** "Today", "Yesterday" or a short date. */
  label: string;
  onDelete: () => void;
}

/** Day separator in the thread, with a control to delete that whole day. */
export function DateDivider({ label, onDelete }: DateDividerProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-neutral-800" />
      <span className="text-[11px] tracking-widest text-neutral-500 uppercase">{label}</span>
      <button
        type="button"
        aria-label={`Delete messages from ${label}`}
        title="Delete this day"
        onClick={onDelete}
        className="grid h-7 w-7 place-items-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
      >
        <PiTrashBold className="text-[13px]" />
      </button>
      <span className="h-px flex-1 bg-neutral-800" />
    </div>
  );
}
