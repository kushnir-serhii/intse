# Functional Specification: Custom AI Instruction

- **Roadmap Item:** Phase 4 — Dashboard › Prompt management (refinement): one personal instruction, reset to default, and choosing which instruction is in use
- **Status:** Draft
- **Author:** Serhii Kushnir

---

## 1. Overview and Rationale (The "Why")

Users can already write their own instruction for the AI, but the experience is confusing:

- The built-in default instruction is never shown on the Dashboard, so users don't know what they are replacing.
- The text box is locked while "Default" is selected, so users can't prepare their own instruction before switching to it.
- There is no clear "Reset to default" action, and users aren't sure whether going back to Default loses their own text.

This change gives every user **one personal instruction** they can write and edit at any time. Users can see the default and their own instruction side by side, **choose** which of the two the AI uses, and **reset to default** in one click without losing their own text.

**Success looks like:** a user can see which instruction is in use and switch between Default and their own in one click, and their own text is never lost by switching.

---

## 2. Functional Requirements (The "What")

### 2.1 See Both Instructions and Choose the One in Use

- The **AI instruction** section on the Dashboard shows two options as selectable cards:
  - **Default:** the built-in instruction text, read-only.
  - **My instruction:** the user's own text, editable (see 2.2).
- Exactly one card is marked "In use". Clicking a card makes it the one in use.
- While "My instruction" is empty, its card can't be selected and shows "Write your instruction first."
- A new choice applies from the next message the user sends. Earlier replies in the current conversation don't change.
- The Chat page's Prompt tab shows the instruction in use and labels it "Default" or "Custom".

**Acceptance Criteria:**
- [ ] When the user opens the Dashboard, then the AI instruction section shows the Default card with the built-in text and the My instruction card, with exactly one marked "In use".
- [ ] Given Default is in use and My instruction contains text, when the user clicks the My instruction card, then My instruction is marked "In use" and Default is not.
- [ ] Given My instruction is in use, when the user opens the Chat page's Prompt tab, then it shows "Custom" and the text of their own instruction.
- [ ] Given My instruction is empty, when the user clicks the My instruction card, then Default stays "In use" and the card shows "Write your instruction first."
- [ ] Given a first-time visitor, when they open the Dashboard, then Default is marked "In use" and My instruction is empty.
- [ ] Given the user switches from Default to My instruction mid-conversation, when they send their next message, then the AI follows their own instruction and earlier replies stay as they were.

### 2.2 Write and Edit My Instruction

- The user has one personal instruction slot. They can type in it whether or not it is in use.
- Typing does not change which instruction is in use.
- Changes save automatically. A small "Saved" note appears within 1 second after the user stops typing.
- The instruction can be up to 2,000 characters. A counter shows the characters used, for example "320 / 2000", and the box doesn't accept more than the limit.
- If the user clears all the text while My instruction is in use, Default becomes in use automatically, and the note "Your instruction is empty — using the default." appears.

**Acceptance Criteria:**
- [ ] Given Default is in use, when the user types in the My instruction box, then the text is accepted and Default stays "In use".
- [ ] Given the user types in the My instruction box, when they stop typing for 1 second, then a "Saved" note appears.
- [ ] Given the user has written an instruction, when they leave the Dashboard and come back, then their text is still in the box.
- [ ] Given the box contains 2,000 characters, when the user types another character, then it is not added and the counter shows "2000 / 2000".
- [ ] Given My instruction is in use, when the user deletes all of its text, then Default becomes "In use" and the note "Your instruction is empty — using the default." appears.

### 2.3 Reset to Default

- While My instruction is in use, a "Reset to default" button appears in the AI instruction section. Clicking it makes Default the instruction in use.
- Reset never deletes or changes the user's own text. Because nothing is lost, no confirmation is asked.
- A short note confirms the change: "Default instruction in use. Your instruction is kept."
- While Default is in use, the "Reset to default" button is hidden.

**Acceptance Criteria:**
- [ ] Given My instruction is in use, when the user clicks "Reset to default", then Default is marked "In use", the note "Default instruction in use. Your instruction is kept." appears, and no confirmation dialog is shown.
- [ ] Given the user has just reset to default, when they look at the My instruction box, then their own text is still there unchanged.
- [ ] Given Default is in use, when the user looks at the AI instruction section, then no "Reset to default" button is shown.
- [ ] Given the user has reset to default, when they send their next message on the Chat page, then the AI follows the default instruction and the Prompt tab shows "Default".

### 2.4 Language and Level Always Apply

- Whichever instruction is in use, the AI still uses the practice language and level chosen on the Dashboard.

**Acceptance Criteria:**
- [ ] Given My instruction is in use and the practice language is French, when the user sends a message, then the AI replies in French.

### 2.5 Remembered on This Device

- The user's instruction text and the choice of which instruction is in use are remembered on this device across visits. They are not carried to other devices.

**Acceptance Criteria:**
- [ ] Given My instruction is in use with the user's text, when they close and reopen the app on the same device, then the Dashboard shows the same text with My instruction marked "In use".

---

## 3. Scope and Boundaries

### In-Scope

- Showing the default instruction read-only next to the user's own instruction.
- One editable personal instruction with autosave and a character limit.
- Choosing which instruction is in use.
- A "Reset to default" action that switches back to the default instruction while keeping the user's own text.
- The Chat Prompt tab reflecting the instruction in use.

### Out-of-Scope

- More than one personal instruction, named instructions, or a library of instructions.
- Editing the built-in default instruction.
- Editing the instruction from the Chat page; the Prompt tab stays read-only and links to the Dashboard.
- Sharing instructions with other users, or syncing them across devices.
- Moving the language and level controls (covered by spec 015, Learning and App Settings Split).
- Removing the Session panel from the chat screen (covered by spec 014, Focused Chat Screen).

---

## Change Log

- [YYYY-MM-DD] — [source reference] — [what behavior changed and why]
