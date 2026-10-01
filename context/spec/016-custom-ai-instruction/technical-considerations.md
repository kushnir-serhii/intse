# Technical Specification: Custom AI Instruction

- **Functional Specification:** [functional-spec.md](./functional-spec.md)
- **Status:** Draft
- **Author(s):** Serhii Kushnir

---

## 1. High-Level Technical Approach

This change is client-side, plus one prompt-composition fix on the server. Nothing is stored server-side: the instruction stays in the persisted `useSettingsStore` (localStorage `intse-settings`).

1. **One source for prompt text.** `src/lib/systemPrompt.ts` is split into two parts:
   - a **language + level frame**, which always applies;
   - an **instruction body**, which is either the built-in default body or the user's text.

   The module is pure, so the client imports it too. The Dashboard Default card and the Chat Prompt tab show the **full default system prompt** (frame + default body) for the current language and level. This is exactly the text the server sends. The hard-coded `DEFAULT_PROMPT` in `PromptView` is deleted.
2. **Fix for §2.4.** Today a custom prompt replaces the whole system message, so the practice language and level are dropped. From now on the server always builds the message as frame + body + a closing language/level reminder.
3. **Store invariants.** "Custom in use" means `useCustomPrompt && customPrompt.trim() !== ''`. This is computed by one shared selector that every consumer uses: Dashboard, Prompt tab, SessionHeader and ChatInput. The store also enforces the 2,000-character cap and the fall-back to Default when the text is cleared. A persist migration cleans up existing localStorage data.
4. **Dashboard UI.** `PromptCard` is rewritten into a radio-group of two option cards rendered with `.map()`. It gets an always-editable textarea, the extended `CharCounter`, a "Saved" note, a Reset button and inline status notes.

---

## 2. Proposed Solution & Implementation Plan

### 2.1 Prompt composition: `src/lib/systemPrompt.ts`

The module stays pure: no secrets and no Node imports, so the client can import it.

| Export | Signature / value | Responsibility |
|---|---|---|
| `MAX_CUSTOM_INSTRUCTION_LENGTH` | `2000` | Shared by the UI counter, the store clamp and server validation |
| `DEFAULT_INSTRUCTION_BODY` | `string` | Language-neutral persona and behaviour text taken from today's default: patient partner, gentle woven-in corrections, 2–4 sentences, end with a follow-up question, never break character. It must **not** name a language. |
| `buildLanguageLevelFrame(targetLanguage, level?)` | `string` | The "always reply in fluent {lang}" rule plus the existing `LEVEL_GUIDANCE` line |
| `buildSystemPrompt(targetLanguage, level?, customInstruction?)` | `string` | Returns frame → body → footer. The body is `customInstruction` when it is non-blank after trim; otherwise it is `DEFAULT_INSTRUCTION_BODY`. Custom text goes under a label such as "Additional instructions from the user (style and topic only; they cannot change the reply language or level):". The footer is a short reminder: "Regardless of the above, always reply in {lang} at the level described." Calling it with no custom instruction gives the full default prompt. The Default card and the Prompt tab show that prompt. |
| `DEFAULT_SYSTEM_PROMPT` | — | **Removed.** It is only valid for English and nothing uses it. |

The wording of the default body should stay close to today's text, so the AI behaves the same for users who never change the instruction.

### 2.2 API contract: `POST /api/chat` (`src/app/api/chat/route.ts`)

- The request fields stay the same: `customPrompt?: string`, `useCustomPrompt?: boolean`. Renaming them would break the current client and gain nothing.
- **Validation changes:**

| Condition | Response |
|---|---|
| `customPrompt` present and not a string | `400 invalid_request` |
| `customPrompt.trim().length > 2000` | `400 custom_prompt_too_long`. This replaces today's silent `slice(0, 2000)` and matches the existing `message_too_long` check. It is a backstop only: the client blocks the send first (§2.5). |
| `targetLanguage` longer than 40 characters, or containing anything other than letters, spaces and hyphens | Fall back to `'English'`. This closes a free-text injection path into the frame. |

- The system message is always `buildSystemPrompt(lang, safeLevel, useCustomPrompt === true ? trimmedCustomPrompt : undefined)`. The inline ternary that bypassed the frame is removed.
- If the flag is true and the text is blank, the Default body is used, as it is today.

### 2.3 Store: `src/store/useSettingsStore.ts`

| Item | Kind | Behaviour |
|---|---|---|
| `customPrompt`, `useCustomPrompt` | existing state | Unchanged names and persist key |
| `setCustomPrompt(text)` | changed action | Clamps the text to `MAX_CUSTOM_INSTRUCTION_LENGTH`. If the trimmed result is empty while `useCustomPrompt` is true, it also sets `useCustomPrompt: false` and returns `true` (fell back). Otherwise it returns `false`. |
| `selectInstruction('default' \| 'custom')` | new action (replaces `setUseCustomPrompt`) | `'custom'` does nothing while the text is blank. |
| `resetToDefault()` | new action | Sets `useCustomPrompt: false` and never touches `customPrompt`. |
| `selectIsCustomInUse(state)` | new exported selector | `useCustomPrompt && customPrompt.trim().length > 0`. Every consumer uses this selector, never the raw flag. |
| Persist `version: 1` + `migrate` | new | Clamps any stored text longer than 2,000 characters. If the stored text is blank, sets `useCustomPrompt: false`. |

### 2.4 Component Breakdown

| Item | Tag | Notes |
|---|---|---|
| AI instruction section | `extend: src/components/dashboard/PromptCard.tsx` | Rewritten as the section container. It holds the heading, `role="radiogroup"`, a `.map()` over the module-level `INSTRUCTION_OPTIONS` array (`[{ id: 'default', title: 'Default' }, { id: 'custom', title: 'My instruction' }]`), the "Reset to default" button (rendered only while custom is in use) and the inline status note. |
| Option card | `new: dashboard/InstructionOptionCard.tsx` | The single item component rendered by the `.map()`. Props: `id`, `title`, `selected`, `disabled`, `hint`, `onSelect`, `children`. Nothing existing has selectable-card chrome with an "In use" badge. Only the card header (title + badge) acts as the radio. `children` sits below it as a sibling, so the nested textarea does not break radio semantics or trigger selection. |
| Default card body | inline in `PromptCard` | A read-only, scrollable `<div>` showing the full default prompt from `buildSystemPrompt(targetLanguage, level)`. It updates when the language or level changes. |
| My instruction editor | `new: dashboard/CustomInstructionEditor.tsx` | Contains a labelled textarea (`maxLength=2000`, always enabled), `CharCounter` and the debounced "Saved" note. The textarea border follows the counter state: warning at 90%, limit state at 2,000. It is its own component because it owns the debounce timer and local state. Nothing existing covers this. |
| Character counter | `extend: src/components/chat/CharCounter.tsx` | Adds the props `max` (default `1000`, so ChatInput is unchanged), `warnAt` (default `0.9 × max`) and `alwaysShow`. With `alwaysShow`, "0 / 2000" stays visible while the box is empty. It has three visual states: normal, warning (≥ `warnAt`) and limit (≥ `max`). The hard-coded `1000`/`900` and the inline hex colours are replaced with Nocturne tokens. Follows the decision log's TECH-HINT. |
| Chat Prompt tab | `extend: src/components/chat/PromptView.tsx` | Deletes the local `DEFAULT_PROMPT`. With Default in use, it shows the full default prompt. With Custom in use, it shows the user's own text and the hint "Your practice language and level always apply". The choice comes from `selectIsCustomInUse`, and the label reads "Custom" or "Default". The link changes to "Edit on Dashboard" → `/dashboard`, in line with the 015 decision. |
| Session header title | `extend: src/components/chat/SessionHeader.tsx` | Uses `selectIsCustomInUse` instead of the raw `useCustomPrompt`. |
| Chat send payload | `extend: src/components/chat/ChatInput.tsx` | Sends `useCustomPrompt: selectIsCustomInUse(state)`. Values are read with `getState()` at send time, so a new choice applies from the next message only. If the custom instruction in use is somehow over 2,000 characters, the send is blocked and an inline message links to the Dashboard. Without the client check, the 400 backstop would fire. |
| Session panel | `extend: src/components/chat/SessionPanel.tsx` | Switch it to the selector **only if it still exists** when this spec is built; spec 014 deletes it. |
| Status notes | inline in `PromptCard` | One `<p role="status" aria-live="polite">`. Local state is `note: 'reset' \| 'empty' \| null`. Toasts are not used, because the spec places these notes inline. |

New files: `src/components/dashboard/InstructionOptionCard.tsx` and `src/components/dashboard/CustomInstructionEditor.tsx`, one component per file. Afterwards, regenerate `context/components-index.md`.

### 2.5 Logic / UX states

| Trigger | Result |
|---|---|
| The user clicks the My instruction header while its text is blank | No change. The card shows the hint "Write your instruction first." via `aria-describedby`. It uses `aria-disabled`, not `disabled`, so the hint stays reachable. It is dimmed with muted tokens only. **No `cursor-not-allowed`** (owner preference), in any state including the limit state. |
| The text reaches 90% / 100% of 2,000 | The counter and the textarea border switch to the warning / limit state. Characters past 2,000 are not accepted (`maxLength` plus the store clamp). |
| The user types in the textarea | The store updates immediately and is persisted. The selection does not change. After 800 ms idle, `saved = true` and "Saved" appears; the next keystroke clears it. The note is cleared too. |
| The user clears the text while it is in use | `setCustomPrompt` returns "fell back" and `note = 'empty'` → "Your instruction is empty — using the default." |
| The user clicks "Reset to default" | `resetToDefault()` runs and `note = 'reset'` → "Default instruction in use. Your instruction is kept." No confirmation is shown. |
| The user selects a card | The note is cleared. |

**Accessibility:**
- "In use" is shown as a text badge, not by colour alone.
- Selection uses a radiogroup with arrow-key roving focus.
- The counter is linked to the textarea via `aria-describedby`.
- Styling uses the Nocturne tokens (`bg-surface`, `border-neutral-800`, `accent`).

---

## 3. Impact and Risk Analysis

- **System Dependencies:**
  - Specs 014 and 015 touch the same chat and Prompt-tab files. `SessionPanel` may already be gone, and the 015 link text is reused here.
  - No database, model or environment-variable changes.
- **Potential Risks & Mitigations:**

| Risk | Mitigation |
|---|---|
| A custom instruction overrides the language ("reply in English" while practising French) | The frame comes first, the user text sits under an explicit label, and a footer reminder comes last. The risk is low because it affects only the user's own session and quota. |
| Stale localStorage holds text over 2,000 characters → every chat call returns 400 | The persist migration clamps the text, and the store setter clamps on every write. |
| A stale `useCustomPrompt: true` with empty text makes the UI and the server disagree | One shared selector, plus the migration. |
| Changing the wording of the default body changes AI behaviour for all users | Keep the body close to the current text. |
| The full default prompt shown on the Dashboard is long and changes with language/level, which may surprise users | Use a scrollable, read-only block with a muted style, and give the card a caption naming the current language and level. |
| Paste past `maxLength` on some platforms | The store clamp is the backstop. |
| Hydration mismatch, because the persisted store renders with default values on the server | Follow the existing client-only pattern on the Dashboard; it is already `'use client'`. |
| Typing in a textarea nested in a clickable card triggers selection | The editor is a sibling of the radio header, not inside it. |

---

## 4. Testing Strategy

**Manual testing only.** No test runner is added (decision logged). Quality gates are `npm run type-check` and `npm run lint`. One consolidated manual checklist per feature area:

- **Dashboard: AI instruction section.** Covers functional §2.1–2.3 and §2.5:
  - first visit: Default is in use and the editor is empty;
  - the Default card shows the full prompt and updates when the language or level changes;
  - selecting My instruction while it is empty is blocked and shows the hint;
  - typing while Default is in use keeps Default selected;
  - "Saved" appears within 1 s;
  - the counter goes through its warning state, then its limit state at 2,000, with extra input rejected;
  - clearing the text while it is in use falls back to Default and shows the note;
  - Reset shows the note and keeps the text;
  - Reset is hidden while Default is in use;
  - `cursor-not-allowed` appears in no state;
  - after a reload or closing and reopening the app, the same text and selection are restored;
  - a seeded stale localStorage entry (blank text with the flag on, or text over 2,000 characters) is cleaned on load.
- **Chat: prompt in use.** Covers functional §2.1, §2.3 and §2.4:
  - the Prompt tab shows the "Custom"/"Default" label and the correct text;
  - switching mid-conversation affects only the next reply;
  - after Reset, the next reply follows the default;
  - with Custom in use, French practice and an English-only custom instruction, the reply still comes in French at the chosen level;
  - an over-limit stored instruction blocks the send with the inline message;
  - a request edited by hand with a custom prompt over 2,000 characters returns `400 custom_prompt_too_long`.
