'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { PasswordInput } from '@/components/ui/PasswordInput';
import { storeCredential } from '@/lib/auth/storeCredential';
import { OWNER_EMAIL } from '@/lib/contact';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords don’t match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok?: boolean; username?: string; error?: string };

      if (res.ok && data.ok) {
        if (data.username) await storeCredential(data.username, password);
        setDone(true);
      } else if (data.error === 'invalid_token') {
        setError('This link is invalid, already used, or expired. Ask for a new one.');
      } else if (data.error === 'password_too_short') {
        setError('Password must be at least 8 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm leading-relaxed text-neutral-500">
        This reset link is incomplete. Open the full link from your email, or ask{' '}
        {OWNER_EMAIL || 'the site owner'} for a new one.
      </p>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-ink text-sm">Your password has been changed.</p>
        <Link
          href="/login"
          className="bg-accent hover:bg-accent/80 rounded-md px-4 py-2 text-center text-sm font-medium text-white transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="new-password" className="text-ink mb-1.5 block text-sm font-medium">
          New password <span className="ml-1 text-neutral-500">(min 8 chars)</span>
        </label>
        <PasswordInput
          id="new-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="text-ink mb-1.5 block text-sm font-medium">
          Repeat new password
        </label>
        <PasswordInput
          id="confirm-password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent/80 mt-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}
