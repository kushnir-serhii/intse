# Functional Specification: Learning and App Settings Split

- **Roadmap Item:** UI/UX refinement (follow-up to Phase 4 — Dashboard and Language Selector): separate learning choices (Dashboard) from app configuration (Settings)
- **Status:** Draft
- **Author:** Serhii Kushnir

---

## 1. Overview and Rationale (The "Why")

The control labelled "Choose the language you want to practise" currently appears on both the Dashboard and the Settings page. The two copies behave differently: on the Dashboard, changing the language starts a new conversation, but in Settings it does not. They also offer different language lists. Users can't tell which one is "the real one", and the Settings page mixes learning choices (language, level) with app setup (AI key, voice).

This change gives each page one clear job:

- **Dashboard = what and how I learn:** practice language, level, and the AI instruction.
- **Settings = how the app works:** AI key, appearance, read-aloud (text to speech), and speech recognition for the microphone.

Each setting lives in exactly one place. Settings also gets a way to choose which language the microphone listens for.

**Success looks like:** every setting appears exactly once in the app, and users find the learning choices on the Dashboard without looking in Settings.

---

## 2. Functional Requirements (The "What")

### 2.1 Dashboard Holds the Learning Settings

- The Dashboard shows these sections, in this order: **Usage**, **Practice language**, **Level**, **AI instruction**. The AI instruction section is defined in spec 016.
- **Practice language** has the label "Practice language" and the helper text "The language the AI talks to you in." It keeps today's Dashboard behavior. Choosing a different language saves the current conversation to history and starts a fresh, empty conversation, with no confirmation.
- **Level** moves here from Settings. It offers the same A1, A2, B1, B2, C1 and C2 choices, with the current one highlighted. A new level applies from the next message the user sends.
- Both choices are remembered on this device across visits.

**Acceptance Criteria:**
- [ ] When the user opens the Dashboard, then they see the Usage, Practice language, Level and AI instruction sections in that order.
- [ ] Given the current conversation has messages and the practice language is English, when the user selects "Spanish" on the Dashboard, then the conversation appears in history and the Chat page opens as an empty new conversation.
- [ ] Given the user has selected "Spanish" on the Dashboard, when they send their next message on the Chat page, then the AI replies in Spanish.
- [ ] Given the level is B1, when the user selects B2 on the Dashboard, then B2 is shown as selected and the Chat page's Prompt tab reads "… · B2".
- [ ] Given the user has chosen French and C1, when they close and reopen the app on the same device, then the Dashboard still shows French and C1 as selected.

### 2.2 Settings Holds the App Settings Only

- The Settings page shows these sections: **Your AI Key**, **Appearance**, **Text to Speech**, **Speech Recognition**.
- Settings no longer contains a practice-language picker or a level picker.
- A one-line note at the top of Settings reads "Practice language, level and AI instruction are on the Dashboard." It includes a link to the Dashboard.

**Acceptance Criteria:**
- [ ] When the user opens Settings, then they see the Your AI Key, Appearance, Text to Speech and Speech Recognition sections and no practice-language or level control.
- [ ] Given the user is on Settings, when they click the Dashboard link in the note at the top, then the Dashboard opens.

### 2.3 Speech Recognition Language (Settings)

- A **Speech Recognition** section in Settings has a "Microphone language" picker. It sets which language the microphone button listens for and writes into the message box.
- The first option, and the default, is "Same as practice language (currently: <language>)". With this option, the microphone always follows the practice language chosen on the Dashboard.
- The rest of the list contains the same languages as the practice-language picker. When the user picks one of these, the microphone keeps listening in that language even if the practice language changes later.
- The choice is remembered on this device across visits.
- If the browser does not support speech recognition, the section shows "Speech recognition isn't supported in this browser." and the picker is unavailable.

**Acceptance Criteria:**
- [ ] Given a first-time visitor, when they open Settings, then "Microphone language" shows "Same as practice language (currently: English)".
- [ ] Given "Microphone language" is "Same as practice language" and the user has switched the practice language to French on the Dashboard, when they dictate a sentence in French using the microphone button, then the French words appear in the message box.
- [ ] Given "Microphone language" is set to "Ukrainian" and the practice language is English, when the user dictates a sentence in Ukrainian, then the Ukrainian words appear in the message box and the AI still replies in English.
- [ ] Given "Microphone language" is set to "Ukrainian", when the user changes the practice language on the Dashboard to Spanish, then Settings still shows "Ukrainian" as the microphone language.
- [ ] Given the browser does not support speech recognition, when the user opens Settings, then they see "Speech recognition isn't supported in this browser." and cannot open the microphone-language picker.

### 2.4 Read-Aloud Voices Follow the Practice Language

- In Settings, the Text to Speech voice list shows only voices for the practice language chosen on the Dashboard, as it does today.

**Acceptance Criteria:**
- [ ] Given the practice language is Spanish, when the user opens the Voice list in Settings, then only Spanish voices (plus "Default (system)") are listed.

### 2.5 Links Point to the New Home

- On the Chat page's Prompt tab, the "Edit in settings" button becomes "Edit on Dashboard" and opens the Dashboard.

**Acceptance Criteria:**
- [ ] Given the user is on the Chat page's Prompt tab, when they click "Edit on Dashboard", then the Dashboard opens with the AI instruction section visible.

---

## 3. Scope and Boundaries

### In-Scope

- Moving the practice language and level to the Dashboard only, and removing them from Settings.
- Using one list of practice languages wherever a language is picked.
- A new microphone-language choice in Settings, which by default follows the practice language.
- A pointer note in Settings and an updated link on the Chat Prompt tab.

### Out-of-Scope

- How the AI instruction section works (covered by spec 016, Custom AI Instruction).
- Removing the Session panel from the chat screen (covered by spec 014, Focused Chat Screen).
- Filling in the empty Appearance section.
- Translating the app's own interface (buttons, labels) into other languages.
- Changing which languages are offered.
- Changing the read-aloud auto-play behavior.
- Syncing settings across devices.

---

## Change Log

- [YYYY-MM-DD] — [source reference] — [what behavior changed and why]
