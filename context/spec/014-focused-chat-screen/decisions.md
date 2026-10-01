# Decisions — 014 Focused Chat Screen

- [spec] Q: Split the UI/UX request into separate specs? → A: User allowed splitting by flow/value → 014 focused chat screen, 015 settings split, 016 custom AI instruction.
- [spec] Q: Should hiding the "side bar" apply to the phone bottom navigation too? → A: User clarified "side bar" means the right-hand Session panel (Practising / Level / Voice / Prompt / Usage today / Use my own API key), not the left navigation. The panel is not needed anymore; during learning only "Usage today" should be shown somewhere on the screen; everything else is set up in Settings or Dashboard.
- [spec] ASSUMED: The panel is removed entirely (desktop rail and phone/tablet slide-over), including the sliders button in the message box that opened it, rather than becoming hideable.
- [spec] ASSUMED: "Usage today" is a single compact line under the session header, visible in all tabs and on all screen sizes, and it replaces the current unlabeled thin progress bar.
- [spec] ASSUMED: Own-key users see "Using your own key · no daily limit"; admins see "No daily limit".
- [spec] ASSUMED: Left navigation sidebar is unchanged (spec renamed from "hideable sidebar" to "focused chat screen").
- [spec] TECH-HINT: Extend the existing chat status bar (thin usage line under the header) with the label text instead of creating a new component; delete the session panel and its mobile sheet from the chat page.
- [tech] Q: Which spec gets the tech spec? → A: 014-focused-chat-screen
- [tech] Q: Admin "0 of 20" flash before role loads — placeholder row until role resolves? → A: Yes, fixed-height aria-hidden placeholder until role !== null
- [tech] Q: No test runner in repo — how to verify? → A: Type-check + lint + one consolidated manual QA checklist; no new tooling
- [tech] Q: Remove now-unused animate-slide-in-right CSS? → A: Yes, remove with the session sheet
- [tech] ASSUMED: Usage bar shows used fraction (not remaining), short fixed width, accent-500 on neutral-900; admin takes precedence over own-key
- [tech] ASSUMED: Level remains changeable via Settings page until spec 015 moves it to Dashboard — not a blocker
- [tasks] ASSUMED: Feature Testing & Regression slice uses general-purpose (no tester agent installed) and runs the manual QA checklist from the tech spec instead of generating test files, since no test runner exists.
- [implement] Q: `npm run lint` is broken (Next 16 removed `next lint`; eslint crashes) — how to proceed? → A: Fix lint first, then continue with lint as a real check.
- [implement] Q: Keep removal of the `ajv ^8.18.0` override (it crashed ESLint)? → A: "Stable libraries and best practices" → removal kept: npm audit lists no ajv advisory, and forcing ajv 8 broke @eslint/eslintrc (needs ajv 6).
- [implement] Q: What does "lint passes" mean given 4296 existing errors (mostly CRLF)? → A: Changed files only — set Prettier `endOfLine: "auto"`, ignore `.awos-tune/` and `.claude/` in ESLint, and require the files 014/015 touch to be lint-clean; whole-repo cleanup deferred.
- [implement] Q: No browser automation (Playwright MCP down) — how to handle visual checks in smoke/QA tasks? → A: Defer to user manual QA: smoke tasks pass on type-check + touched-file lint + page serves; visual items listed as NOT RUN and collected into one manual checklist at the end.
