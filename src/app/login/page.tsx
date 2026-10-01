'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
    setUsername('');
    setPassword('');
    setShowPassword(false);
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

      const data = (await res.json()) as { role?: string; error?: string };

      if (res.ok && data.role) {
        useUserStore.getState().setRoleFromApi(data.role);
        router.push('/');
      } else {
        if (data.error === 'username_taken') {
          setError('That username is already taken.');
        } else if (data.error === 'invalid_credentials') {
          setError('Invalid username or password.');
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

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="text-ink mb-1.5 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-bg text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 outline-none focus:ring-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-ink mb-1.5 block text-sm font-medium">
              Password
              {mode === 'register' && <span className="ml-1 text-neutral-500">(min 8 chars)</span>}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : undefined}
                className="bg-bg text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-3 py-2 pr-10 text-sm placeholder-neutral-500 outline-none focus:ring-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="hover:text-ink absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
          </div>

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
