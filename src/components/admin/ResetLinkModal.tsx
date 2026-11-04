'use client';

import { useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri';

export interface ResetLink {
  email: string;
  url: string;
  expiresAt: string;
}

interface ResetLinkModalProps {
  link: ResetLink | null;
  onClose: () => void;
}

export function ResetLinkModal({ link, onClose }: ResetLinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (link === null) return null;

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the link is still selectable in the field
    }
  }

  const expires = new Date(link.expiresAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const subject = encodeURIComponent('Your INTSE password reset link');
  const body = encodeURIComponent(
    `Hi,\n\nHere is your password reset link. It works once and expires at ${expires}:\n\n${link.url}\n\nIf you didn't ask for this, ignore this email.`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-surface mx-4 w-full max-w-md rounded-xl border border-neutral-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-ink mb-2 text-lg font-semibold">Reset link ready</h2>
        <p className="mb-4 text-sm leading-relaxed text-neutral-500">
          Send it only to <span className="text-ink font-medium">{link.email}</span>. Write a new
          email to this address — don&apos;t press Reply on the request, its reply-to can be faked.
          The link works once and expires at {expires}.
        </p>

        <div className="mb-4 flex gap-2">
          <input
            readOnly
            value={link.url}
            onFocus={(e) => e.target.select()}
            aria-label="Reset link"
            className="bg-bg text-ink min-w-0 flex-1 rounded-md border border-neutral-800 px-3 py-2 font-mono text-xs outline-none"
          />
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="text-ink flex items-center gap-1.5 rounded-md border border-neutral-800 px-3 text-xs font-medium transition-colors hover:bg-neutral-900"
          >
            {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-ink rounded-lg border border-neutral-800 px-4 py-2 text-sm transition-colors hover:bg-neutral-900"
          >
            Close
          </button>
          <a
            href={`mailto:${link.email}?subject=${subject}&body=${body}`}
            className="bg-accent hover:bg-accent-400 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            Write email
          </a>
        </div>
      </div>
    </div>
  );
}
