import { PRACTICE_LANGUAGES } from '@/lib/languages';

export function langToSpeechCode(lang: string): string {
  const language = PRACTICE_LANGUAGES.find((l) => l.name === lang);
  return language?.code ?? 'en-US';
}
