# Technical Specification: Learning and App Settings Split

- **Functional Specification:** [functional-spec.md](./functional-spec.md)
- **Status:** Draft
- **Author(s):** Serhii Kushnir

---

## 1. High-Level Technical Approach

This is a frontend-only change. There are no API, MongoDB or infrastructure changes. All the settings involved already live in the persisted Zustand store `useSettingsStore` (`localStorage` key `intse-settings`).

1. **One language list.** Move the 24 practice languages out of `LanguageSelectorCard` into a shared module. Each language name is paired with its BCP-47 speech code where one is mapped today. The practice picker, the new microphone picker and `langToSpeechCode` all read from that one source. **Speech codes stay limited to today's 8 languages.** The other 16 still fall back to `en-US` for the microphone and the voice filter, but the UI now **tells the user** instead of failing silently (2.3).
2. **Dashboard = learning.** Reuse `LanguageSelectorCard` with new copy. Add a `LevelCard` that moves the CEFR picker from Settings. Show them in the order Usage → Practice language → Level → AI instruction.
3. **Settings = app.** Remove the Language and Level sections. Add a pointer note linking to the Dashboard, and a new Speech Recognition section with a "Microphone language" picker.
4. **Microphone language.** Add a new persisted store field, `micLanguage: string | null`. `null` means "same as practice language". `ChatInput` subscribes to the resolved value reactively, so the microphone follows the practice language unless the user picked a specific microphone language.
5. **Link update.** On the Chat page's Prompt tab, "Edit in settings" becomes "Edit on Dashboard" and points to `/dashboard#ai-instruction`.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Shared language data: `src/lib/languages.ts` (new module, not a component)

| Export | Shape | Responsibility |
|---|---|---|
| `PRACTICE_LANGUAGES` | `readonly { name: string; code?: string }[]` | The 24 languages currently in `LanguageSelectorCard`. `code` is set only for the 8 languages mapped today: English `en-US`, French `fr-FR`, Spanish `es-ES`, German `de-DE`, Portuguese `pt-BR`, Italian `it-IT`, Ukrainian `uk-UA` and Polish `pl-PL`. This is the single source for every language picker and every speech-code lookup. |
| `PRACTICE_LANGUAGE_NAMES` | `readonly string[]` | Names derived from the list above, for pickers. |
| `hasSpeechSupport(name)` | `(name: string) => boolean` | `true` when the language has a `code`. The UI notes in 2.3 use it. |

`src/utils/langToSpeechCode.ts` becomes a thin lookup over `PRACTICE_LANGUAGES`, keeping its `en-US` fallback and its signature. `useTTS` and `useSpeechToText` therefore need no API change. The local `LANGUAGES` constant in `LanguageSelectorCard` is deleted. Adding a code later is a one-line data change, and the notes disappear on their own.

### 2.2 Store: `src/store/useSettingsStore.ts`

| Item | Kind | Behaviour |
|---|---|---|
| `micLanguage` | new state, `string \| null`, default `null` | `null` means follow the practice language. A string is one of `PRACTICE_LANGUAGE_NAMES`. It is persisted with the rest of the store. |
| `setMicLanguage(lang: string \| null)` | new action | Sets `micLanguage` and leaves `selectedVoiceURI` alone (voices follow the practice language, not the mic). |
| `selectMicLanguage(state)` | new exported selector | Returns `state.micLanguage ?? state.targetLanguage`. |
| `setTargetLanguage` | unchanged | Still resets `selectedVoiceURI` and leaves `micLanguage` alone, so an explicit mic choice stays put (AC 2.3-4). |

**Persistence:** Zustand `persist` shallow-merges stored state over defaults, so a returning visitor without `micLanguage` gets `null` with no migration. Spec 016 adds `version: 1` + `migrate` to this same store. Whichever spec ships second rebases onto the other. Neither needs a migration step for `micLanguage`.

### 2.3 Component Breakdown

| UI item | Tag | Notes |
|---|---|---|
| Dashboard page layout | `extend: src/app/(admin)/dashboard/page.tsx` | Remove the page-level bordered `<section>` wrappers: each card already renders its own, so today the borders are doubled. Render the four cards in a single column in the order Usage, Practice language, Level, AI instruction. These are four different components, not a repeated item, so they are listed explicitly rather than mapped. If the page's mount effect sees a `location.hash`, it scrolls that element into view as a fallback for 2.5. |
| Usage | `reuse: src/components/dashboard/UsageIndicator.tsx` | Unchanged. |
| Practice language | `extend: src/components/dashboard/LanguageSelectorCard.tsx` | Heading becomes "Practice language" and the helper text "The language the AI talks to you in." It imports `PRACTICE_LANGUAGE_NAMES`, and the stray `mb-8` on its root is dropped. The save-to-history → clear → new session flow is unchanged, with no confirmation and no navigation (see 2.6). |
| Level | `new: dashboard/LevelCard.tsx` | The CEFR segmented control, moved from the Settings page: `CEFR_LEVELS.map()` to one button each, `aria-pressed`, using `level` / `setLevel`. Nothing on the Dashboard shows a level today, and the Settings markup is page-inline, not a component, so there is nothing to reuse. |
| AI instruction | `extend: src/components/dashboard/PromptCard.tsx` | Add `id="ai-instruction"` and `scroll-mt-6` on its root `<section>` as the scroll target. Spec 016 rewrites this card's contents, and the `id` must survive that rewrite. |
| Settings page | `extend: src/app/(admin)/settings/page.tsx` | Delete the Language and Level sections and their now-dead state: `targetLanguage` setter use, `level`/`setLevel`, `langSearch`, `langFocused`, `displayNames`, `availableLanguages`, `filteredLanguages` and the `handleLang*` handlers. `targetLanguage` is still read for `useTTS`. Add the pointer note as the first element under the `<h1>`: "Practice language, level and AI instruction are on the **Dashboard**." with a `next/link` to `/dashboard`. Section order: Your AI Key, Appearance, Text to Speech, Speech Recognition. |
| Speech Recognition | `new: settings/SpeechRecognitionSection.tsx` | A bordered section matching the other Settings cards, with a labelled native `<select id="mic-language">`. The first option has value `''` and the label "Same as practice language (currently: {targetLanguage})". It is followed by `PRACTICE_LANGUAGE_NAMES.map()` to `<option>`. `''` maps to `setMicLanguage(null)`. Options without speech support get the suffix " (listens in English for now)". When the *resolved* mic language (`selectMicLanguage`) has no speech support, a muted note under the picker reads "The microphone doesn't support {lang} yet, so it will listen in English." If the browser has no speech recognition, the select is `disabled` and the line "Speech recognition isn't supported in this browser." is shown. Its own file because the Settings page is already long and this section owns its support-detection state. It starts a new `src/components/settings/` domain folder, since this is the first Settings-only component. |
| TTS voice list | `reuse:` (inline in settings page) | Unchanged. It keeps following `targetLanguage` through `useTTS` (AC 2.4). One addition: when `!hasSpeechSupport(targetLanguage)`, a muted note under the Voice select reads "Voices for {lang} aren't supported yet, so English voices are shown." |
| Chat Prompt tab link | `extend: src/components/chat/PromptView.tsx` | Link text "Edit on Dashboard", `href="/dashboard#ai-instruction"`, and the doc comment updated. Spec 016 plans the same link change: whichever ships first does it, and the other keeps the hash. |
| Microphone wiring | `extend: src/components/chat/ChatInput.tsx` | Replace the non-reactive `useSettingsStore.getState().targetLanguage` (≈ line 88) with `useSettingsStore(selectMicLanguage)`. `useSpeechToText` already updates `recognition.lang` in an effect when `lang` changes. The reply language is unaffected, because the chat payload still sends `targetLanguage` (AC 2.3-3). |
| Browser support helper | `extend: src/hooks/useSpeechToText.ts` | Export `isSpeechRecognitionSupported()`, wrapping the existing `getSpeechRecognitionConstructor()`. `SpeechRecognitionSection` calls it inside `useEffect`, not during render. Until the check runs, the section renders as supported-but-pending, which avoids an SSR/client hydration mismatch. |

New files (one component per file):
- `src/components/dashboard/LevelCard.tsx`
- `src/components/settings/SpeechRecognitionSection.tsx`
- `src/lib/languages.ts` (data module)

Afterwards, regenerate `context/components-index.md` with `node .awos-tune/scripts/component-index.mjs`.

### 2.4 Microphone language resolution

| `micLanguage` | Practice language | Mic listens in | AI replies in |
|---|---|---|---|
| `null` (default) | English → French | English, then French after the change | Practice language |
| `'Ukrainian'` | English | `uk-UA` | English |
| `'Ukrainian'` | changed to Spanish | still `uk-UA`, and Settings still shows Ukrainian | Spanish |

### 2.5 "Edit on Dashboard" scroll

The App Router `Link` with a hash calls `scrollIntoView` on the target id. That scrolls the dashboard's inner `overflow-y-auto` container as well, as long as the element exists at commit time, which it does because `PromptCard` renders synchronously from the persisted store. The page-level mount effect in 2.3 covers cold loads.

### 2.6 Practice-language change and navigation

The existing `LanguageSelectorCard` behaviour is kept: save the conversation to history if it has messages, set the language, clear messages, and create a new session id. The Dashboard does **not** auto-navigate to Chat. AC 2.1-2 ("the Chat page opens as an empty new conversation") is read as "the next time the user opens Chat it is empty". This matches spec 013 and the decision log ("keeps today's Dashboard behavior").

---

## 3. Impact and Risk Analysis

- **System dependencies:**
  - `useSettingsStore` (persisted), `useTTS` and `useSpeechToText` through `langToSpeechCode`.
  - `ChatInput`, `PromptView`, `PromptCard`.
  - Spec 016, which edits `useSettingsStore`, `PromptCard` and `PromptView`.
  - Spec 014, which deletes `SessionPanel`, the only other "Practising"/Level entry point. Settings links in `SessionPanel` disappear with 014. Until then they still point at `/settings`, which is harmless.

| Risk | Mitigation |
|---|---|
| 16 of the 24 practice languages have no speech code, so the mic listens in English and English voices are listed. AC 2.3-2 and AC 2.4 hold only for the 8 mapped languages. | Accepted for now (decision log). The Settings notes in 2.3 say so explicitly. The follow-up is to add codes in `src/lib/languages.ts`. |
| A stored `micLanguage` is no longer in the list. | `langToSpeechCode` falls back to `en-US`. `SpeechRecognitionSection` treats an unknown value as `''` (Same as practice). |
| Hydration mismatch from detecting speech support during render. | Detect inside `useEffect` in the new section (2.3). |
| A merge conflict with spec 016 on the store, `PromptCard` and `PromptView`. | The changes here are small and additive: one field and selector, one `id`, one link. Documented in 2.2 and 2.3 so the second spec rebases cleanly. |
| Users look for language or level in Settings out of habit. | The pointer note at the top of Settings links to the Dashboard. |
| The Dashboard hash scroll does nothing on some navigation paths. | The mount-time fallback scroll on the dashboard page. |

---

## 4. Testing Strategy

The repo has no unit or E2E runner (`package.json` has only `lint`, `type-check` and `format:check`), and adding one is out of scope, consistent with spec 014. Verification is consolidated into one pass for the feature:

- **Static:**
  - `npm run type-check` and `npm run lint` pass.
  - A grep finds no "Choose the language you want to practise", no "Edit in settings", and no `LANGUAGES` constant outside `src/lib/languages.ts`.
- **Manual QA: Dashboard / Settings split** (ACs 2.1, 2.2, 2.5):
  1. Section order on the Dashboard, with no doubled borders.
  2. With a non-empty chat, switching English → Spanish puts the conversation in history and the next Chat visit is empty. The next reply is in Spanish.
  3. Changing B1 → B2 highlights B2, and the Prompt tab reads "… · B2".
  4. After a reload, French and C1 persist.
  5. Settings shows only the four sections plus the note, and the note's link opens the Dashboard.
  6. On the Prompt tab, "Edit on Dashboard" lands with the AI instruction visible, both from in-app navigation and on a cold load.
- **Manual QA: microphone and voices** (ACs 2.3, 2.4), in Chrome, plus Firefox for the unsupported case:
  1. A first visit shows "Same as practice language (currently: English)".
  2. With Same as practice and practice language French, French dictation appears in the box.
  3. With Ukrainian on the mic and English practice, Ukrainian dictation appears and the AI replies in English.
  4. Changing practice to Spanish keeps Ukrainian on the mic in Settings.
  5. Firefox shows the unsupported message and a disabled picker.
  6. With Spanish practice, the voice list shows only Spanish voices plus "Default (system)".
  7. With Japanese practice (unmapped), Settings shows the "listens in English" mic note and the "English voices are shown" TTS note. Japanese is suffixed in the mic picker.
