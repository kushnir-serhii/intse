'use client';

import {
  cloneElement,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipSide = 'top' | 'bottom';

const HOVER_DELAY = 300;
const LONG_PRESS_DELAY = 500;
const TOUCH_HIDE_DELAY = 1800;
const GAP = 8;
const VIEWPORT_MARGIN = 16;

interface TooltipProps {
  /** Tooltip text. Empty or missing content renders the trigger untouched. */
  content?: ReactNode;
  /** Preferred side; flips automatically when there is no room. */
  side?: TooltipSide;
  /** Extra classes for the wrapper (e.g. `block`, `shrink-0`). */
  className?: string;
  /** Make a non-interactive trigger (plain text) reachable by keyboard. */
  focusable?: boolean;
  /** A single element — the trigger. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

interface Position {
  top: number;
  left: number;
}

/**
 * Lightweight tooltip. Hover (300ms) and focus on desktop, long-press (500ms)
 * on touch; a normal tap still reaches the trigger, a long-press swallows the
 * click that follows it. Rendered in a portal so overflow never clips it.
 */
export function Tooltip({
  content,
  side = 'bottom',
  className = '',
  focusable = false,
  children,
}: TooltipProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    setOpen(false);
    setPos(null);
  }, [clearTimers]);

  const showAfter = useCallback(
    (delay: number) => {
      clearTimers();
      showTimer.current = setTimeout(() => setOpen(true), delay);
    },
    [clearTimers],
  );

  useEffect(() => clearTimers, [clearTimers]);

  // Measure and place: preferred side, flipped if it overflows, clamped to the viewport.
  useLayoutEffect(() => {
    if (!open || !wrapperRef.current || !tipRef.current) return;
    const trigger = wrapperRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const roomAbove = trigger.top - VIEWPORT_MARGIN;
    const roomBelow = window.innerHeight - trigger.bottom - VIEWPORT_MARGIN;
    const need = tip.height + GAP;
    let placed = side;
    if (side === 'bottom' && roomBelow < need && roomAbove > roomBelow) placed = 'top';
    if (side === 'top' && roomAbove < need && roomBelow > roomAbove) placed = 'bottom';
    const top = placed === 'bottom' ? trigger.bottom + GAP : trigger.top - GAP - tip.height;
    const maxLeft = window.innerWidth - VIEWPORT_MARGIN - tip.width;
    const centered = trigger.left + trigger.width / 2 - tip.width / 2;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(centered, maxLeft));
    // Positioning needs the rendered size, so this state sync is intentional.
    setPos({ top, left });
  }, [open, side, content]);

  // Escape, outside tap, scroll and resize dismiss it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onDown = (e: Event) => {
      if (!wrapperRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', hide);
      window.removeEventListener('scroll', hide, true);
    };
  }, [open, hide]);

  if (content === undefined || content === null || content === '') return children;

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') showAfter(HOVER_DELAY);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') hide();
  };
  const onTouchStart = () => {
    longPressed.current = false;
    clearTimers();
    showTimer.current = setTimeout(() => {
      longPressed.current = true;
      setOpen(true);
    }, LONG_PRESS_DELAY);
  };
  const onTouchEnd = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (longPressed.current) {
      hideTimer.current = setTimeout(hide, TOUCH_HIDE_DELAY);
    }
  };
  const swallowLongPressClick = (e: MouseEvent) => {
    if (!longPressed.current) return;
    longPressed.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const trigger = focusable ? children : cloneElement(children, { 'aria-describedby': id });

  return (
    <span
      ref={wrapperRef}
      className={`inline-flex ${className}`}
      tabIndex={focusable ? 0 : undefined}
      aria-describedby={focusable ? id : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={() => showAfter(HOVER_DELAY)}
      onBlur={hide}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={() => {
        if (showTimer.current) clearTimeout(showTimer.current);
      }}
      onTouchCancel={hide}
      onContextMenu={(e) => {
        if (longPressed.current) e.preventDefault();
      }}
      onClickCapture={swallowLongPressClick}
    >
      {trigger}
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0 }}
            className={`bg-surface text-ink pointer-events-none fixed z-[100] max-w-[240px] rounded-lg border border-neutral-700 px-2.5 py-1.5 text-xs leading-snug shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-opacity duration-150 ${
              pos ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
