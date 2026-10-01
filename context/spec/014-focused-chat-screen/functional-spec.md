# Functional Specification: Focused Chat Screen

- **Roadmap Item:** UI/UX refinement (follow-up to Phase 2–4 chat experience): remove the Session panel from the chat screen and keep only today's usage visible while practising
- **Status:** Draft
- **Author:** Serhii Kushnir

---

## 1. Overview and Rationale (The "Why")

During practice, the Chat page shows a **Session** panel. On desktop it sits on the right side of the screen. On phones and tablets it slides in from the right when the user taps the sliders button in the message box. The panel repeats controls that already live elsewhere: practice language, level, voice, prompt, usage today, and "Use my own API key".

While learning, the user needs only one thing from that panel: **how much of today's allowance is left**. Everything else is set up before a session, on the Dashboard (practice language, level, AI instruction) or in Settings (voice, own API key). Showing those controls during practice takes space, adds a second place to change the same setting, and distracts from the conversation.

This change removes the Session panel. A compact "usage today" indicator stays visible on the chat screen.

**Success looks like:** while practising, the chat screen shows only the conversation, the session header and the remaining usage. Every other setting is changed in exactly one place, the Dashboard or Settings.

---

## 2. Functional Requirements (The "What")

### 2.1 The Session Panel Is Removed

- The Chat page no longer shows the Session panel on any screen size. On desktop there is no right-hand panel, and the conversation area uses the freed width.
- The sliders ("Prompt settings") button in the message box, which opened the panel on phones and tablets, is removed.
- None of the panel's controls are lost. They live on these pages:
  - Practice language, Level and AI instruction: on the **Dashboard** (see spec 015 and spec 016).
  - Voice and speed defaults, and your own API key: in **Settings**.

**Acceptance Criteria:**
- [ ] Given the user is on the Chat page on a desktop screen, when the page loads, then no Session panel appears on the right and the conversation area widens into that space.
- [ ] Given the user is on the Chat page on a phone, when they look at the message box, then there is no sliders button, and nothing on the chat screen opens a Session panel.
- [ ] Given the Session panel is gone, when the user wants to change the practice language or level, then they can do it on the Dashboard.
- [ ] Given the Session panel is gone, when the user wants to add their own API key, then they can do it in Settings.

### 2.2 Compact "Usage Today" Indicator on the Chat Screen

- Directly under the session header (the area with the Chat, Talk and Prompt tabs), a single compact line shows today's usage. It is visible on every screen size and in all three tabs.
- **Shared-key users** see a short progress bar and the text "X of Y messages today", for example "3 of 20 messages today". The bar fills as messages are used.
- **Own-key users** see "Using your own key · no daily limit" and no bar.
- **Admins** see "No daily limit" and no bar.
- The count updates within 2 seconds after each AI reply finishes.
- This line replaces the unlabeled thin progress bar that currently sits under the header.

**Acceptance Criteria:**
- [ ] Given a shared-key user who has sent 3 of 20 messages today, when they open the Chat page, then they see "3 of 20 messages today" with a bar filled about 15%.
- [ ] Given a shared-key user has sent 3 messages today, when they send one more and the AI reply finishes, then within 2 seconds the line reads "4 of 20 messages today".
- [ ] Given a user has saved their own API key, when they open the Chat page, then the line reads "Using your own key · no daily limit" and no bar is shown.
- [ ] Given the user is signed in as an admin, when they open the Chat page, then the line reads "No daily limit" and no bar is shown.
- [ ] Given a shared-key user has used all 20 messages, when they open the Chat page, then the line reads "20 of 20 messages today" with a full bar, and the existing limit-reached message still appears when they try to send.
- [ ] Given the user switches between the Chat, Talk and Prompt tabs, when each tab is shown, then the usage line stays visible under the header.

---

## 3. Scope and Boundaries

### In-Scope

- Removing the Session panel (the desktop right rail and the phone/tablet slide-over) and the button that opened it.
- A single compact usage line under the session header on the Chat page.

### Out-of-Scope

- Hiding or collapsing the left navigation sidebar or the phone bottom navigation bar. These stay as they are.
- Changes to the session header (progress ring, Chat/Talk/Prompt tabs, read-aloud toggle, End button).
- Per-message controls (speed, voice, repeat, copy, delete) on AI messages. These stay as they are.
- Where the practice language and level live (covered by spec 015, Learning and App Settings Split).
- How the AI instruction is managed (covered by spec 016, Custom AI Instruction).
- Changes to how daily limits are counted or reset.

---

## Change Log

- [YYYY-MM-DD] — [source reference] — [what behavior changed and why]
