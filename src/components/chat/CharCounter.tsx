'use client';

export type CharCounterState = 'normal' | 'warning' | 'limit';

const DEFAULT_MAX = 1000;

const STATE_CLASS: Record<CharCounterState, string> = {
  normal: 'text-neutral-500',
  warning: 'text-warning',
  limit: 'text-danger',
};

export function getCharCounterState(
  count: number,
  max: number = DEFAULT_MAX,
  warnAt: number = max * 0.9,
): CharCounterState {
  if (count >= max) return 'limit';
  if (count >= warnAt) return 'warning';
  return 'normal';
}

interface CharCounterProps {
  count: number;
  max?: number;
  warnAt?: number;
  alwaysShow?: boolean;
  id?: string;
}

export function CharCounter({
  count,
  max = DEFAULT_MAX,
  warnAt = max * 0.9,
  alwaysShow = false,
  id,
}: CharCounterProps) {
  if (count === 0 && !alwaysShow) return null;

  const state = getCharCounterState(count, max, warnAt);

  return (
    <span id={id} className={`text-xs ${STATE_CLASS[state]}`}>
      {count} / {max}
    </span>
  );
}
