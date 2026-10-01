
# Tasks: Focused Chat Screen

- [x] **Slice 1: Labelled "usage today" line under the chat header**

  > After this slice the Chat page shows the new usage line (shared-key / own-key / admin / pending) in place of the unlabeled thin bar. The Session panel still exists.
  - [x] extend: `src/components/chat/ChatStatusBar.tsx` — derive `mode` (`pending` → `admin` → `ownKey` → `shared`) from `useUserStore` (`role`, `dailyRequests`, `dailyRequestLimit`) and `useSettingsStore` (`apiKey`) per tech spec 2.2. `pending` renders a fixed-height `aria-hidden` empty row; `admin` renders "No daily limit"; `ownKey` renders "Using your own key · no daily limit"; `shared` renders a short fixed-width (≈64–96px) used-fraction bar (`min(100, round(used/limit×100))`, `bg-accent-500` on `bg-neutral-900`, `role="progressbar"` with `aria-valuenow/min/max` and `aria-label="Messages used today"`) plus "X of Y messages today" (`text-xs tabular-nums text-neutral-500`, no wrap). Row uses `px-4` and small vertical padding, no new props. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] Verify (smoke): run `npm run type-check` and `npm run lint`. Start the dev server (record its PID), open the Chat page and confirm the new line renders under the header in Chat, Talk and Prompt tabs. Stop the server by its PID and delete any screenshots produced. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 2: Remove the Session panel and its button**

  > After this slice the Chat page has no right rail, no slide-over and no sliders button; the conversation spans the full width.
  - [x] extend: `src/components/chat/ChatInput.tsx` — drop the `onOpenSettings` prop, the sliders ("Prompt settings") button and the `PiSlidersHorizontalBold` import. Other toolbar buttons unchanged. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] extend: `src/app/(admin)/page.tsx` — remove `showSessionSheet` state and its Esc-handler line (keep the handler for the new-conversation dialog), the `<aside>` right rail, the session-sheet overlay, the `voiceName` computation, the `selectedVoiceURI` selector, and the `PiXBold` / `SessionPanel` imports and the `onOpenSettings` prop. Keep `voices`, `ttsSpeed` and the speed/voice handlers (used by `ChatThread`). Centre column takes full width. **[Agent: nextjs-frontend]** **[Model: sonnet]**
  - [x] delete: `src/components/chat/SessionPanel.tsx` and its export in `src/components/chat/index.ts`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Remove the unused `animate-slide-in-right` keyframes (and its reduced-motion override) from `src/app/styles/globals.css`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Regenerate the component index with `node .awos-tune/scripts/component-index.mjs` so `SessionPanel` drops out of `context/components-index.md`. **[Agent: nextjs-frontend]** **[Model: haiku]**
  - [x] Verify (smoke): `npm run type-check` and `npm run lint` pass; grep finds no `SessionPanel`, `onOpenSettings`, `showSessionSheet` or `animate-slide-in-right` in `src/`. Start the dev server (record its PID), confirm at desktop and phone widths the Chat page has no right rail and no sliders button, then stop the server by PID and delete any screenshots. **[Agent: general-purpose]** **[Model: sonnet]**

- [x] **Slice 3: Feature Testing & Regression**

  > Verifies the whole feature end-to-end against functional-spec.md, run after all implementation slices are complete.
  - [x] Read functional-spec.md acceptance criteria in full. The repo has no unit/E2E runner and none is added (decisions.md, [tech]), so no test files are generated. Instead, run the single consolidated manual QA checklist from tech spec section 4 (8 steps covering ACs 2.1 and 2.2: desktop/phone layout, controls still reachable in Dashboard/Settings, shared 3/20 → 4/20 within 2s, own-key, admin with no "0 of 20" flash on hard reload, 20/20 with limit modal, tab switching). Record pass/fail per step in your report. **[Agent: general-purpose]** **[Model: sonnet]**
  - [x] Run `npm run type-check` and `npm run lint`. All must pass. Fix any failures before proceeding, and delete any screenshots or recordings produced. **[Agent: general-purpose]** **[Model: sonnet]**
