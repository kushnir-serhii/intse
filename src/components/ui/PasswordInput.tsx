'use client';

import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className="bg-bg text-ink focus:border-accent focus:ring-accent w-full rounded-md border border-neutral-800 px-3 py-2 pr-10 text-sm placeholder-neutral-500 outline-none focus:ring-1"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="hover:text-ink absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
      </button>
    </div>
  );
}
