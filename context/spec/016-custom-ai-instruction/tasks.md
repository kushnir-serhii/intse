<!-- skip-tests: true -->

# Tasks — 016 Custom AI Instruction

> No test runner in the repo (decision logged), so no automated tests are written. Each Verify task is a smoke check: `npm run type-check`, `npm run lint`, plus one quick manual check where the slice is user-visible. The final slice runs the consolidated manual acceptance checklist from technical-considerations §4.
> Do not use `cursor-not-allowed` anywhere (owner preference).

- [x] **Slice 1: Server always applies language and level (frame + body + footer)**

  > App stays runnable: chat works as before, but a custom prompt no longer drops the practice language/level.
  - [x] In `src/lib/systemPrompt.ts` add `MAX_CUSTOM_INSTRUCTION_LENGTH = 2000`, `DEFAULT_INSTRUCTION_BODY` (language-neutral, close to today's default text), `buildLanguageLevelFrame()`, and `buildSystemPrompt(targetLanguage, level?, customInstruction?)` returning frame → body → footer. Remove `DEFAULT_SYSTEM_PROMPT`. Module stays pure (client-importable). **[Agent: nextjs-backend]** **[Model: sonnet]**
  - [x] In `src/app/api/chat/route.ts` always build the system message via `buildSystemPrompt(lang, safeLevel, useCustomPrompt === true ? trimmedCustomPrompt : undefined)`; remove the inline ternary. Validate: non-string `customPrompt` → 400 `invalid_request`; trimmed length > 2000 → 400 `custom_prompt_too_long` (replaces `slice`); `targetLanguage` > 40 chars or not letters/spaces/hyphens → fall back to `'English'`. **[Agent: nextjs-backend]** **[Model: sonnet]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; grep confirms no remaining `DEFAULT_SYSTEM_PROMPT` usages; with the dev server running, one curl to `/api/chat` with a 2,001-char `customPrompt` returns 400 `custom_prompt_too_long`. Stop the dev server by its recorded PID. **[Agent: nextjs-backend]** **[Model: sonnet]**

- [x] **Slice 2: Store invariants and a single "custom in use" selector**

  > App stays runnable: existing consumers switch to the shared selector; stale localStorage is cleaned.
  - [x] In `src/store/useSettingsStore.ts`: `setCustomPrompt` clamps to `MAX_CUSTOM_INSTRUCTION_LENGTH` and, if the trimmed result is empty while `useCustomPrompt` is true, sets it false and returns `true` (fell back), else `false`. Add `selectInstruction('default'|'custom')` (custom is a no-op while blank; replaces `setUseCustomPrompt`), `resetToDefault()` (never touches `customPrompt`), exported `selectIsCustomInUse(state)`. Add persist `version: 1` + `migrate` (clamp >2000 chars; blank text → `useCustomPrompt: false`). Update all callers of `setUseCustomPrompt`. **[Agent: nextjs-frontend]** **[Model: opus]**
  - [x] `extend: src/components/chat/SessionHeader.tsx` — use `selectIsCustomInUse` instead of the raw flag. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] `extend: src/components/chat/ChatInput.tsx` — send `useCustomPrompt: selectIsCustomInUse(getState())` read at send time; if the custom instruction in use is over 2,000 chars, block the send and show an inline message linking to `/dashboard`. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] `extend: src/components/chat/SessionPanel.tsx` — switch to the selector only if the file still exists (spec 014 may have deleted it). _(No-op: file deleted by spec 014; no references in `src`.)_ **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; start the app, send one chat message with Default in use and confirm a normal reply; seed localStorage `intse-settings` with blank text + flag on and confirm it loads cleaned. Stop the server by PID. **[Agent: nextjs-frontend]** **[Model: sonnet]**

- [x] **Slice 3: Dashboard shows Default and My instruction cards and lets the user choose**

  > User-visible: see both instructions, exactly one "In use", click to switch; typing never changes selection.
  - [x] `new: src/components/dashboard/InstructionOptionCard.tsx` — props `id, title, selected, disabled, hint, onSelect, children`; header (title + text "In use" badge) is the radio (`role="radio"`, `aria-checked`, `aria-disabled` not `disabled`, `aria-describedby` hint); `children` rendered as a sibling below the header. Nocturne tokens only, no `cursor-not-allowed`. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] `new: src/components/dashboard/CustomInstructionEditor.tsx` — labelled textarea (`maxLength=2000`, always enabled) bound to `setCustomPrompt`; typing does not change the selection. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] `extend: src/components/dashboard/PromptCard.tsx` — rewrite as the section container: heading, `role="radiogroup"` with arrow-key roving focus, `.map()` over module-level `INSTRUCTION_OPTIONS` rendering `InstructionOptionCard`; Default card body is a read-only scrollable block showing `buildSystemPrompt(targetLanguage, level)` with a caption naming language/level; My instruction card contains `CustomInstructionEditor`; blank custom card shows "Write your instruction first." and ignores selection. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; open `/dashboard`, confirm first visit shows Default "In use" and empty editor, Default text changes with language/level, clicking blank My instruction shows the hint, typing then clicking switches selection. Stop the server by PID. **[Agent: nextjs-frontend]** **[Model: sonnet]**

- [x] **Slice 4: Counter, autosave note and empty-text fallback**

  > User-visible: "Saved" note, "N / 2000" counter with warning/limit states, auto-fallback when cleared.
  - [x] `extend: src/components/chat/CharCounter.tsx` — add props `max` (default 1000), `warnAt` (default 0.9×max), `alwaysShow`; three states normal/warning/limit; replace hard-coded 1000/900 and hex colours with Nocturne tokens; ChatInput usage unchanged. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] `extend: src/components/dashboard/CustomInstructionEditor.tsx` — add `CharCounter` (`max=2000`, `alwaysShow`, linked via `aria-describedby`), textarea border follows counter state, debounced "Saved" note (800 ms idle, cleared on next keystroke). **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] `extend: src/components/dashboard/PromptCard.tsx` — inline `<p role="status" aria-live="polite">` with local `note: 'reset'|'empty'|null`; when `setCustomPrompt` returns `true` set `note='empty'` → "Your instruction is empty — using the default."; selecting a card clears the note. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; on `/dashboard` type text and see "Saved" within ~1 s, counter warning at 1800 and limit at 2000 with extra input rejected, clearing text while in use falls back to Default with the note, reload keeps text. Stop the server by PID. **[Agent: nextjs-frontend]** **[Model: sonnet]**

- [x] **Slice 5: Reset to default**

  > User-visible: one-click return to Default that keeps the user's text.
  - [x] `extend: src/components/dashboard/PromptCard.tsx` — render a "Reset to default" button only while `selectIsCustomInUse`; click calls `resetToDefault()` and sets `note='reset'` → "Default instruction in use. Your instruction is kept."; no confirmation dialog. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; on `/dashboard` select My instruction, click Reset, confirm Default in use, note shown, text intact, button hidden while Default in use. Stop the server by PID. **[Agent: nextjs-frontend]** **[Model: sonnet]**

- [x] **Slice 6: Chat Prompt tab reflects the instruction in use**

  > User-visible: Prompt tab labels "Default"/"Custom" and shows the correct text.
  - [x] `extend: src/components/chat/PromptView.tsx` — delete local `DEFAULT_PROMPT`; Default in use shows `buildSystemPrompt(language, level)`; Custom in use shows the user's text plus hint "Your practice language and level always apply"; label from `selectIsCustomInUse`; link text "Edit on Dashboard" → `/dashboard`. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify: `npm run type-check` and `npm run lint` pass; in the chat Prompt tab confirm label/text for Default, Custom, and after Reset. Stop the server by PID. **[Agent: nextjs-frontend]** **[Model: sonnet]**

- [x] **Slice 7: Manual acceptance and index refresh**

  > Runs the consolidated manual checklist (technical-considerations §4); no automated tests are written (decision logged).
  - [x] Regenerate the component index: `node .awos-tune/scripts/component-index.mjs`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Walk the full Dashboard and Chat checklists from technical-considerations §4 against functional-spec acceptance criteria (incl. French + English-only custom instruction, mid-conversation switch, over-limit stored text blocks send, hand-edited >2000 request returns 400, no `cursor-not-allowed` in any state) and report pass/fail per item. **[Agent: general-purpose]** **[Model: sonnet]**
