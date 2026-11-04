'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { PasswordInput } from '@/components/ui/PasswordInput';
import { storeCredential } from '@/lib/auth/storeCredential';
import { OWNER_EMAIL } from '@/lib/contact';
import { useUserStore } from '@/store/useUserStore';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (useUserStore.getState().role === 'owner') {
      router.push('/');
    }
  }, [router]);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
    setUsername('');
    setPassword('');
    setShowForgot(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = mode === 'login' ? '/api/admin/login' : '/api/admin/register';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as { role?: string; error?: string; minutesLeft?: number };

      if (res.ok && data.role) {
        // Register stores the email lowercased; login keeps what matched (older accounts keep casing)
        const saved = mode === 'register' ? username.trim().toLowerCase() : username.trim();
        await storeCredential(saved, password);
        useUserStore.getState().setRoleFromApi(data.role);
        router.push('/');
      } else {
        if (data.error === 'username_taken') {
          setError('An account with this email already exists.');
        } else if (data.error === 'invalid_email') {
          setError('Enter a valid email address.');
        } else if (data.error === 'invalid_credentials') {
          setError('Invalid email or password.');
        } else if (data.error === 'too_many_attempts') {
          setError(
            `Too many failed attempts. Try again in ${data.minutesLeft ?? 15} min, or reset your password.`,
          );
          setShowForgot(true);
        } else if (data.error === 'username and password (min 8 chars) are required') {
          setError('Password must be at least 8 characters.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg fixed inset-0 flex items-center justify-center">
      <div className="bg-surface w-full max-w-sm rounded-xl border border-neutral-800 p-8">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-lg border border-neutral-800 p-0.5">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-accent text-white' : 'hover:text-ink text-neutral-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'register' ? 'bg-accent text-white' : 'hover:text-ink text-neutral-500'
            }`}
          >
            Register
          </button>
        </div>

        <form
          method="post"
          action={mode === 'login' ? '/api/admin/login' : '/api/admin/register'}
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="username" className="text-ink mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="username"
              name="username"
              // Older accounts may have non-email usernames, so only enforce the format on register
              type={mode === 'register' ? 'email' : 'text'}
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-bg text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-1"
            />
            {mode === 'register' && (
              <p className="mt-1.5 text-xs text-neutral-500">
                Use a real address — it&apos;s the only way to recover your password.
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="password" className="text-ink block text-sm font-medium">
                Password
                {mode === 'register' && (
                  <span className="ml-1 text-neutral-500">(min 8 chars)</span>
                )}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgot((v) => !v)}
                  className="text-accent hover:text-accent-400 text-xs transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 8 : undefined}
            />
          </div>

          {mode === 'login' && showForgot && (
            <div className="bg-bg rounded-md border border-neutral-800 p-3 text-xs leading-relaxed text-neutral-500">
              Send an email to{' '}
              {OWNER_EMAIL ? (
                <a href={`mailto:${OWNER_EMAIL}`} className="text-accent hover:underline">
                  {OWNER_EMAIL}
                </a>
              ) : (
                'the site owner'
              )}{' '}
              <span className="text-ink">from the address you registered with</span>. You&apos;ll
              get a reset link back at that address. It works once and expires in 1 hour.
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent/80 mt-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {loading
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
