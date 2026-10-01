'use client';

import { useNotificationStore } from '@/store/useNotificationStore';

export function ConfirmModal() {
  const modal = useNotificationStore((s) => s.modal);
  const closeModal = useNotificationStore((s) => s.closeModal);

  if (modal === null) return null;

  function handleConfirm() {
    modal!.onConfirm();
    closeModal();
  }

  const confirmClass =
    modal.variant === 'danger'
      ? 'bg-[#DA3633] hover:bg-red-600 text-white'
      : 'bg-accent hover:bg-accent-400 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={closeModal}
    >
      <div
        className="bg-surface mx-4 w-full max-w-sm rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-white">{modal.title}</h2>
        <p className="mb-6 text-sm text-gray-400">{modal.message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmClass}`}
            onClick={handleConfirm}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
