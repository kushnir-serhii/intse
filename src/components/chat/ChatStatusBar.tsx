'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

/** Share of the daily limit at which the meter turns to the warning tone. */
const WARN_AT = 0.8;

/**
 * Hairline "usage today" meter pinned to the composer's bottom edge. Pairs
 * with the composer's "N left today" label, so it carries no text of its own.
 * Renders only on the shared key — admin and own-key users have no limit.
 * The parent must be `relative overflow-hidden` so the rounded corners clip it.
 */
export function ChatStatusBar() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const role = useUserStore((s) => s.role);
  const dailyRequests = useUserStore((s) => s.dailyRequests);
  const dailyRequestLimit = useUserStore((s) => s.dailyRequestLimit);

  if (role !== 'user' || dailyRequestLimit <= 0 || apiKey !== '') return null;

  const used = Math.min(dailyRequests, dailyRequestLimit);
  const ratio = used / dailyRequestLimit;
  const tone = ratio >= 1 ? 'bg-danger' : ratio >= WARN_AT ? 'bg-warning' : 'bg-accent-500';

  return (
    <div
      role="progressbar"
      aria-label="Messages used today"
      aria-valuemin={0}
      aria-valuemax={dailyRequestLimit}
      aria-valuenow={used}
      aria-valuetext={`${used} of ${dailyRequestLimit} messages used today`}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-neutral-800/60"
    >
      <div
        className={`h-full transition-[width,background-color] duration-500 ${tone}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
