'use client';

import { IntseMark } from '@/components/ui';

import styles from './TypingIndicator.module.css';

export function TypingIndicator() {
  return (
    <div className="mr-auto flex items-start gap-2.5">
      <span className="text-accent-400 mt-0.5 shrink-0">
        <IntseMark size={26} state="thinking" />
      </span>
      <div className="bg-surface flex items-center gap-1.5 rounded-[14px_14px_14px_4px] border border-neutral-800 px-3.5 py-3.5">
        <span className={styles.dot} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
      </div>
    </div>
  );
}
