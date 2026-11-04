'use client';

import { useChatStore } from '@/store/useChatStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

export function UsageIndicator(): React.ReactElement {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const dailyRequests = useUserStore((s) => s.dailyRequests);
  const dailyRequestLimit = useUserStore((s) => s.dailyRequestLimit);
  const sessionTokens = useChatStore((s) => s.sessionTokens);

  const isByoKey = apiKey !== '';
  const usedPercent =
    dailyRequestLimit > 0 ? Math.min(100, (dailyRequests / dailyRequestLimit) * 100) : 0;

  return (
    <section className="bg-surface rounded-lg border border-neutral-800 p-6">
      <h2 className="text-ink mb-1 text-base font-semibold">Usage</h2>
      <p className="text-sm text-neutral-500">
        {isByoKey
          ? `${sessionTokens.toLocaleString('en-US')} tokens used`
          : `${dailyRequests} / ${dailyRequestLimit} messages today`}
      </p>
      {!isByoKey && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-900">
          <div className="bg-accent h-full rounded-full" style={{ width: `${usedPercent}%` }} />
        </div>
      )}
    </section>
  );
}
