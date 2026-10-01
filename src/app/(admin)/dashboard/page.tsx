'use client';

import { useEffect } from 'react';

import { LanguageSelectorCard } from '@/components/dashboard/LanguageSelectorCard';
import { LevelCard } from '@/components/dashboard/LevelCard';
import PromptCard from '@/components/dashboard/PromptCard';
import { UsageIndicator } from '@/components/dashboard/UsageIndicator';

export default function DashboardPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <div className="custom-scrollbar bg-bg flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 sm:px-8">
      <h1 className="text-ink mb-8 font-[--font-inter] text-2xl font-bold">Dashboard</h1>
      <UsageIndicator />
      <LanguageSelectorCard />
      <LevelCard />
      <PromptCard />
    </div>
  );
}
