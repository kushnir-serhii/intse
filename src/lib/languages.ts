export interface LanguageOption {
  name: string;
  code?: string;
}

export const PRACTICE_LANGUAGES: readonly LanguageOption[] = [
  { name: 'English', code: 'en-US' },
  { name: 'Spanish', code: 'es-ES' },
  { name: 'French', code: 'fr-FR' },
  { name: 'German', code: 'de-DE' },
  { name: 'Italian', code: 'it-IT' },
  { name: 'Portuguese', code: 'pt-BR' },
  { name: 'Russian' },
  { name: 'Chinese' },
  { name: 'Japanese' },
  { name: 'Korean' },
  { name: 'Arabic' },
  { name: 'Hindi' },
  { name: 'Dutch' },
  { name: 'Polish', code: 'pl-PL' },
  { name: 'Turkish' },
  { name: 'Swedish' },
  { name: 'Norwegian' },
  { name: 'Danish' },
  { name: 'Finnish' },
  { name: 'Greek' },
  { name: 'Czech' },
  { name: 'Romanian' },
  { name: 'Hungarian' },
  { name: 'Ukrainian', code: 'uk-UA' },
] as const;

export const PRACTICE_LANGUAGE_NAMES: readonly string[] = PRACTICE_LANGUAGES.map(
  (lang) => lang.name,
);

export function hasSpeechSupport(name: string): boolean {
  return PRACTICE_LANGUAGES.some((lang) => lang.name === name && lang.code !== undefined);
}
