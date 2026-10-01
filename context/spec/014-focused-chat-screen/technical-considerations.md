# Technical Specification: Focused Chat Screen

- **Functional Specification:** [functional-spec.md](./functional-spec.md)
- **Status:** Draft
- **Author(s):** Serhii Kushnir

---

## 1. High-Level Technical Approach

This is a frontend-only change on the Chat page (`src/app/(admin)/page.tsx`). There are no API, data-model or infrastructure changes.

1. **Remove** the `SessionPanel` component and both places it renders: the desktop `lg:` right rail and the phone/tablet slide-over sheet. Also remove the sliders ("Prompt settings") button in `ChatInput` that opened the sheet.
2. **Extend** the existing `ChatStatusBar`, which is already mounted under `SessionHeader` for all three views, into a labelled usage line with three modes: shared-key, own-key and admin. It replaces today's unlabeled 2px "remaining" gradient bar.

The usage count already updates live. `ChatInput` calls `useUserStore.incrementRequests()` when an AI reply finishes streaming, and `ChatStatusBar` subscribes to that store. The line therefore re-renders as soon as the reply finishes, well within the 2-second requirement, with no polling or new fetch.

No controls are lost:
- Level: Settings (`src/app/(admin)/settings/page.tsx`, Level section) today, and the Dashboard after spec 015.
- Practice language and prompt: Dashboard (`LanguageSelectorCard`, `PromptCard`).
- Voice and own API key: Settings.

---

## 2. Proposed Solution & Implementation Plan (The "How")

### 2.1 Component Breakdown

| UI item | Tag | Notes |
|---|---|---|
| Usage line under the header | `extend: src/components/chat/ChatStatusBar.tsx` | Add the label and the three modes (see 2.2). It stays a single component with no new props, and reads from `useUserStore` (`role`, `dailyRequests`, `dailyRequestLimit`) and `useSettingsStore` (`apiKey`). |
| Session header | `reuse: src/components/chat/SessionHeader.tsx` | Unchanged. |
| Message box | `extend: src/components/chat/ChatInput.tsx` | This is a removal: drop the `onOpenSettings` prop, the sliders button and the `PiSlidersHorizontalBold` import. The other toolbar buttons (Auto, admin reset, mic, send) are unchanged. |
| Session panel | **delete** `src/components/chat/SessionPanel.tsx` | Also remove its export from `src/components/chat/index.ts`. The only consumer is `page.tsx`. |
| Chat page | `extend: src/app/(admin)/page.tsx` | This is a removal: see 2.3. |
| Dashboard usage card | `reuse: src/components/dashboard/UsageIndicator.tsx` | Not touched. It intentionally shows a different, card-style summary (tokens for own-key users). |

No new component files are created, and no repeated structures are introduced.

### 2.2 `ChatStatusBar`: display logic

The component derives a `mode` from store state. Rules are checked top to bottom:

| Condition | Mode | Renders |
|---|---|---|
| `role === null` (role not yet resolved) **or** `role === 'user'` with `dailyRequestLimit <= 0` (stats not loaded) | `pending` | An empty row at the same height as the real line, `aria-hidden`. This prevents layout shift and prevents admins from briefly seeing "0 of 20". |
| `role === 'admin'` | `admin` | Text "No daily limit", no bar. |
| `apiKey !== ''` | `ownKey` | Text "Using your own key · no daily limit", no bar. |
| otherwise | `shared` | A short bar plus the text "X of Y messages today". |

Shared-mode details:
- **Bar fill** shows the *used* fraction, `min(100, round(used / limit × 100))`. For example, 3/20 gives 15% and 20/20 gives 100%. This inverts today's "remaining" bar, and the current `Math.max(6, …)` minimum width is dropped. The bar is short and fixed-width (≈ 64–96px), not full-width, and uses the Nocturne accent token (`bg-accent-500` on `bg-neutral-900`, as `SessionPanel` used).
- **Accessibility:** the bar gets `role="progressbar"`, `aria-valuenow={min(used, limit)}`, `aria-valuemin={0}`, `aria-valuemax={limit}`, and `aria-label="Messages used today"`.
- **Text:** `text-xs tabular-nums text-neutral-500`, on one line. On narrow screens the bar stays left of the text and the text does not wrap.

Layout: the row sits directly under `SessionHeader` with horizontal padding matching the header (`px-4`) and a small vertical padding. It renders in all three views because it is outside the `view` switch in `page.tsx`, as it is today.

The limit behaviour stays the same: `isLimitReached` in `page.tsx` and `LimitReachedModal` are untouched.

### 2.3 `page.tsx` cleanup

Remove:
- the `showSessionSheet` state, and its line in the Esc-key handler (the handler stays for the new-conversation dialog)
- the `<aside>` right rail and the session-sheet overlay block
- the `voiceName` computation and the `selectedVoiceURI` selector (both unused afterwards)
- the `PiXBold` import, the `SessionPanel` import, and the `onOpenSettings` prop passed to `ChatInput`

Keep `voices`, `ttsSpeed` and the speed/voice handlers, because `ChatThread` still uses them. The outer `flex` container stays, and the centre column takes the full width.

### 2.4 Out of scope / unchanged

- CSS: the `animate-slide-in-right` keyframes in `src/app/styles/globals.css` become unused. Remove them, including the reduced-motion override, in the same change. Their only consumer was the deleted sheet.
- API (`/api/stats`, `/api/chat`), the Mongoose models and the limit counting are all unchanged.
- `context/components-index.md` must be regenerated afterwards with `node .awos-tune/scripts/component-index.mjs`, so that `SessionPanel` drops out of the index.

---

## 3. Impact and Risk Analysis

- **System dependencies:** `useUserStore` (role, daily counters, which are persisted except for `role`), `useSettingsStore.apiKey`, and the existing `incrementRequests()` call in `ChatInput` on stream completion. Role resolution happens in `EnrollmentGate`, `Navigation` and the login page through `setRole` / `setRoleFromApi`.

| Risk | Mitigation |
|---|---|
| Admins briefly see "0 of 20 messages today". `role` is not persisted, while `dailyRequestLimit` is. | The `pending` mode hides content until `role !== null`. |
| Layout jumps when the line switches from empty to filled. | The `pending` row keeps the same fixed height as the real line. |
| Removing Level from the chat screen before spec 015 ships leaves users unable to change level. | Not a blocker: the Settings page already has a Level selector. |
| The count drifts from the server after a midnight reset or an admin reset. | Already handled: the midnight `/api/stats` refetch in `page.tsx` and the admin reset in `ChatInput` both call `updateStats`, and the line re-renders from the store. |
| Users miss the quick "Use my own API key" link. | Accepted per the functional spec: the key is managed in Settings, which the left navigation already reaches. |

---

## 4. Testing Strategy

The repo has no unit or E2E runner installed: `package.json` has only `lint`, `type-check` and `format:check`. This spec does not add one. Verification is consolidated into one pass for this feature area:

- **Static:** `npm run type-check` and `npm run lint` pass. A grep shows no remaining references to `SessionPanel`, `onOpenSettings` or `showSessionSheet`.
- **Manual QA checklist (Chat page)**, one walkthrough covering all acceptance criteria:
  1. Desktop width: no right rail, and the conversation spans the freed width (AC 2.1-1).
  2. Phone width: no sliders button in the message box, and nothing opens a panel (AC 2.1-2).
  3. Level and language can be changed in Settings or on the Dashboard, and the API key in Settings (AC 2.1-3/4).
  4. Shared-key user at 3/20 sees "3 of 20 messages today" with a bar about 15% full. After sending one message, it reads "4 of 20" as soon as the reply finishes (AC 2.2-1/2).
  5. Own-key user sees "Using your own key · no daily limit" and no bar (AC 2.2-3).
  6. Admin sees "No daily limit" and no bar, with no "0 of 20" flash on hard reload (AC 2.2-4).
  7. A user at 20/20 sees a full bar, and the limit modal still appears on send (AC 2.2-5).
  8. Switching between Chat, Talk and Prompt keeps the line visible (AC 2.2-6).
- If spec 015 or 016 introduces a test runner first, convert this checklist into a single `ChatStatusBar` test file that renders the four modes (pending, admin, ownKey, shared at 3/20 and 20/20).
