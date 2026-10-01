
# Tasks: Learning and App Settings Split

- [x] **Slice 1: One shared language list, new Practice language copy**

  > After this slice every language lookup reads from `src/lib/languages.ts`, and the Dashboard language card shows the new heading and helper text. Behavior is otherwise unchanged.
  - [x] new: `src/lib/languages.ts` (data module) — export `PRACTICE_LANGUAGES` (the 24 languages from `LanguageSelectorCard`; `code` only for English `en-US`, French `fr-FR`, Spanish `es-ES`, German `de-DE`, Portuguese `pt-BR`, Italian `it-IT`, Ukrainian `uk-UA`, Polish `pl-PL`), `PRACTICE_LANGUAGE_NAMES`, and `hasSpeechSupport(name)`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Rewrite `src/utils/langToSpeechCode.ts` as a thin lookup over `PRACTICE_LANGUAGES`, keeping its signature and `en-US` fallback. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] extend: `src/components/dashboard/LanguageSelectorCard.tsx` — import `PRACTICE_LANGUAGE_NAMES`, delete the local `LANGUAGES` constant, heading "Practice language", helper text "The language the AI talks to you in.", drop the stray `mb-8` on the root. Save-to-history → clear → new session flow unchanged. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify (smoke): `npm run type-check` and `npm run lint` pass. Start the dev server (record its PID), open the Dashboard, confirm the new copy and that switching language still works; stop the server by PID and delete any screenshots. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 2: Dashboard holds Level and the AI instruction anchor**

  > After this slice the Dashboard shows Usage → Practice language → Level → AI instruction, and Level is changeable there and persists. Settings still has its own copy until Slice 3.
  - [x] new: `src/components/dashboard/LevelCard.tsx` — CEFR segmented control moved from the Settings page: `CEFR_LEVELS.map()` to one button each, `aria-pressed`, using `level` / `setLevel` from `useSettingsStore`; bordered card matching the other Dashboard cards. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] extend: `src/components/dashboard/PromptCard.tsx` — add `id="ai-instruction"` and `scroll-mt-6` on the root `<section>`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] extend: `src/app/(admin)/dashboard/page.tsx` — remove the page-level bordered `<section>` wrappers (cards already render their own), render a single column in order Usage, Practice language, Level, AI instruction (explicit, not mapped); in the mount effect, if `location.hash` is set, scroll that element into view. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify (smoke): `npm run type-check` and `npm run lint` pass. Start the dev server (record its PID), confirm section order and no doubled borders, change B1 → B2 and reload to see it persist, load `/dashboard#ai-instruction` cold and confirm the scroll; stop the server by PID and delete any screenshots. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 3: Settings holds app settings only; links point to the Dashboard**

  > After this slice Settings has no language or level control, shows the pointer note, and the Prompt tab link says "Edit on Dashboard".
  - [x] extend: `src/app/(admin)/settings/page.tsx` — delete the Language and Level sections and their dead state (`level`/`setLevel`, `langSearch`, `langFocused`, `displayNames`, `availableLanguages`, `filteredLanguages`, `handleLang*`, the `setTargetLanguage` use; keep reading `targetLanguage` for `useTTS`). Add the pointer note as the first element under the `<h1>`: "Practice language, level and AI instruction are on the **Dashboard**." with a `next/link` to `/dashboard`. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] extend: `src/app/(admin)/settings/page.tsx` — under the Voice select, when `!hasSpeechSupport(targetLanguage)`, add a muted note "Voices for {lang} aren't supported yet, so English voices are shown." **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] extend: `src/components/chat/PromptView.tsx` — link text "Edit on Dashboard", `href="/dashboard#ai-instruction"`, update the doc comment. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Verify (smoke): `npm run type-check` and `npm run lint` pass; grep finds no "Choose the language you want to practise" or "Edit in settings" in `src/`. Start the dev server (record its PID), confirm Settings sections and the note link, and that "Edit on Dashboard" lands on the AI instruction; stop the server by PID and delete any screenshots. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 4: Microphone language in Settings**

  > After this slice Settings has a Speech Recognition section; the microphone follows the practice language by default or a chosen language.
  - [x] extend: `src/store/useSettingsStore.ts` — add persisted `micLanguage: string | null` (default `null`), `setMicLanguage(lang)` (leaves `selectedVoiceURI` alone), and exported `selectMicLanguage = s => s.micLanguage ?? s.targetLanguage`. `setTargetLanguage` unchanged. No persist migration. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] extend: `src/hooks/useSpeechToText.ts` — export `isSpeechRecognitionSupported()` wrapping `getSpeechRecognitionConstructor()`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] new: `src/components/settings/SpeechRecognitionSection.tsx` (new `settings/` domain folder) — bordered card matching other Settings sections with labelled native `<select id="mic-language">`: first option value `''` "Same as practice language (currently: {targetLanguage})", then `PRACTICE_LANGUAGE_NAMES.map()` options (suffix " (listens in English for now)" when `!hasSpeechSupport`). `''` ↔ `setMicLanguage(null)`; an unknown stored value is treated as `''`. Muted note "The microphone doesn't support {lang} yet, so it will listen in English." when the resolved mic language is unmapped. Detect support inside `useEffect` (pending counts as supported); when unsupported, disable the select and show "Speech recognition isn't supported in this browser." **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] extend: `src/app/(admin)/settings/page.tsx` — render `SpeechRecognitionSection` after Text to Speech (order: Your AI Key, Appearance, Text to Speech, Speech Recognition). **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] extend: `src/components/chat/ChatInput.tsx` — replace the non-reactive `useSettingsStore.getState().targetLanguage` (≈ line 88) with `useSettingsStore(selectMicLanguage)`; chat payload still sends `targetLanguage`. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Regenerate the component index with `node .awos-tune/scripts/component-index.mjs`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Verify (smoke): `npm run type-check` and `npm run lint` pass. Start the dev server (record its PID), confirm the picker's default label, that choosing Ukrainian persists across a practice-language change, and that the mic button still works on Chat; stop the server by PID and delete any screenshots. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 5: Feature Testing & Regression**

  > Verifies the whole feature end-to-end against functional-spec.md, run after all implementation slices are complete.
  - [x] Read functional-spec.md acceptance criteria in full. The repo has no unit/E2E runner and none is added (decisions.md, [tech]), so no test files are generated. Instead, run the two consolidated manual QA checklists from tech spec section 4 — "Dashboard / Settings split" (6 steps, ACs 2.1, 2.2, 2.5) and "microphone and voices" (7 steps, ACs 2.3, 2.4; Chrome, plus Firefox for the unsupported case). Record pass/fail per step in your report. **[Agent: general-purpose]** **[Model: sonnet]**
  - [x] Run `npm run type-check` and `npm run lint`; confirm no `LANGUAGES` constant exists outside `src/lib/languages.ts`. All must pass. Fix any failures before proceeding, and delete any screenshots or recordings produced. **[Agent: general-purpose]** **[Model: sonnet]**
