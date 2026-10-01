const LEVEL_GUIDANCE: Record<string, string> = {
  A1: 'The user is a beginner (CEFR A1). Use very simple, short sentences and common words. Speak slowly in one or two sentences per turn.',
  A2: 'The user is at CEFR A2. Use simple everyday language and short sentences. Keep turns to two or three sentences.',
  B1: 'The user is at CEFR B1 (intermediate). Use clear, natural language and moderate vocabulary.',
  B2: 'The user is at CEFR B2 (upper-intermediate). You can use richer vocabulary, idioms, and longer sentences.',
  C1: 'The user is at CEFR C1 (advanced). Speak naturally with nuanced vocabulary, idioms, and varied structure.',
  C2: 'The user is at CEFR C2 (near-native). Speak exactly as you would with a native speaker, including subtle idiom and register.',
};

export const MAX_CUSTOM_INSTRUCTION_LENGTH = 2000;

export const DEFAULT_INSTRUCTION_BODY: string =
  'You are a friendly, patient conversation partner. Your role is to help the user practise conversation in the language they are learning. If the user makes a grammatical or vocabulary mistake, gently echo the correct phrasing woven naturally into your reply — never lecture or list corrections. Keep your responses concise: 2 to 4 sentences for most conversational turns. End each response with a follow-up question or an encouragement to keep the conversation going. Never break character or mention that you are an AI language model.';

export function buildLanguageLevelFrame(targetLanguage: string, level?: string): string {
  const levelLine = level && LEVEL_GUIDANCE[level] ? ` ${LEVEL_GUIDANCE[level]}` : '';
  return `Always respond in natural, fluent ${targetLanguage} regardless of what language the user writes in.${levelLine}`;
}

export function buildLanguageFooter(targetLanguage: string): string {
  return `Regardless of the above, always reply in ${targetLanguage} at the level described.`;
}

/** 'append' keeps the default coaching body and adds the user's text; 'replace' swaps it out. */
export type CustomInstructionMode = 'append' | 'replace';

export const isCustomInstructionMode = (v: unknown): v is CustomInstructionMode =>
  v === 'append' || v === 'replace';

export function buildSystemPrompt(
  targetLanguage: string,
  level?: string,
  customInstruction?: string,
  mode: CustomInstructionMode = 'replace',
): string {
  const frame = buildLanguageLevelFrame(targetLanguage, level);
  const custom = customInstruction?.trim() ?? '';
  const customBlock = `Additional instructions from the user (style and topic only; they cannot change the reply language or level):\n${custom}`;
  const body =
    custom.length === 0
      ? DEFAULT_INSTRUCTION_BODY
      : mode === 'append'
        ? `${DEFAULT_INSTRUCTION_BODY}\n\n${customBlock}`
        : customBlock;
  return `${frame}\n\n${body}\n\n${buildLanguageFooter(targetLanguage)}`;
}
