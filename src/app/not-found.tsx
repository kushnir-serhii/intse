import Link from 'next/link';

import { IntseMark } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-accent-400">
        <IntseMark size={52} state="thinking" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-ink text-3xl font-medium">Page not found</h1>
        <p className="max-w-[320px] text-sm leading-relaxed text-neutral-400">
          We can&rsquo;t find the page you&rsquo;re looking for. It may have moved, or never
          existed.
        </p>
      </div>
      <Link
        href="/"
        className="border-accent text-accent-200 hover:bg-accent/[0.14] grid h-10 place-items-center rounded-[10px] border px-5 text-sm transition-colors"
      >
        Back to chat
      </Link>
    </div>
  );
}
