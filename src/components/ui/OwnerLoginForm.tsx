'use client';

import { type FormEvent, useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

interface OwnerLoginFormProps {
  onSuccess: (username: string, role: string) => void;
  onBack: () => void;
}

export default function OwnerLoginForm({ onSuccess, onBack }: OwnerLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { role?: string; error?: string };

      if (!res.ok || !data.role) {
        setError(
          data.error === 'invalid_credentials'
            ? 'Invalid username or password.'
            : 'Something went wrong. Please try again.',
        );
        return;
      }

      // Account exists but is not an owner in the DB — drop the session it just got
      if (data.role !== 'owner') {
        await fetch('/api/admin/logout', { method: 'POST' });
        setError('This account is not an owner.');
        return;
      }

      onSuccess(username.trim(), data.role);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-[400px] flex-col items-center gap-4"
    >
      <h1 className="text-ink text-2xl font-[var(--font-inter)] font-bold">Owner sign in</h1>

      <input
        type="text"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Login"
        required
        autoFocus
        className="bg-surface text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-4 py-3 placeholder-neutral-500 outline-none focus:ring-1"
      />

      <div className="relative w-full">
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="bg-surface text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-4 py-3 pr-11 placeholder-neutral-500 outline-none focus:ring-1"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="hover:text-ink absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
        </button>
      </div>

      {error && <p className="w-full text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-accent w-full rounded-md px-4 py-3 font-[var(--font-inter)] font-semibold text-white hover:bg-[#388bfd] active:bg-[#1f6feb] disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="hover:text-ink text-sm font-[var(--font-inter)] text-neutral-500"
      >
        Back
      </button>
    </form>
  );
}
