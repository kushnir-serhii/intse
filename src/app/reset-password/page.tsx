import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/auth';

// The token lives in the URL — never leak it to other sites via the Referer header
export const metadata: Metadata = {
  title: 'Reset password',
  referrer: 'no-referrer',
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-bg fixed inset-0 flex items-center justify-center">
      <div className="bg-surface w-full max-w-sm rounded-xl border border-neutral-800 p-8">
        <h1 className="text-ink mb-6 text-xl font-bold">Reset password</h1>
        {/* useSearchParams needs a Suspense boundary in the app router */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
