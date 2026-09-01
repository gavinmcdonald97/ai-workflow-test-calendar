**Your events are still there when you come back tomorrow.**

## What it is

Events are kept in this browser, on this machine, so closing the tab no longer loses them.

## Why it exists

A calendar you have to retype every morning is worse than a piece of paper. Persistence is the difference between a demo and something you'd actually use.

## How it connects

Builds on **#5 (✍️ Adding an Event)**, since there is nothing to save until events exist. 🗑️ Changing Your Mind will save its edits and deletions through the same mechanism.

## Scope

Simplest version only: saved in this browser, on this machine, using the browser's own storage. No account, no server, no syncing between devices.

Deliberately parked: syncing between devices, export/import, backup, accounts and login, syncing with Google or Apple Calendar.

## How it's built

Storage sits in `js/events.js` alongside the events themselves, under one versioned key (`calendar.events.v1`). The plan suggested a separate module; it is here instead because load and save are used only by the events and the file is still short enough to read in one go.

- `loadEvents()` runs when the page opens, before anything is drawn.
- `saveEvents()` writes the **whole list** back after every change, so removals are saved as well as additions.

Unreadable data gives an empty calendar rather than a broken page. The stored text can be absent, be blocked outright (private browsing), not be JSON at all, or be JSON of the wrong shape — all caught. Entries are checked individually, so **one bad entry loses that entry, not the whole calendar**.

## Acceptance criteria

Events are added through the real panel and the page is then genuinely reloaded. Storage is never pre-seeded through `addInitScript`, because that re-runs on every navigation — including a reload — and would overwrite what the app had just saved, making "it survived a refresh" pass for the wrong reason.

- [x] **After adding events and reloading, they are all still there, on the right days, with the right titles and times.**
  — `test:` [`tests/05-events-that-stick-around.spec.js` :: Criterion 1](tests/05-events-that-stick-around.spec.js) · red→green ✅
  **Red:** reverted `js/events.js` to the card below, which saves nothing — failed.

- [x] **Events added in a different month are still there when navigating back.**
  — `test:` [`tests/05-events-that-stick-around.spec.js` :: Criterion 2](tests/05-events-that-stick-around.spec.js) · red→green ✅
  Adds in November, reloads, confirms the calendar reopens on September with nothing on screen, then navigates back and finds it — so it is proved to be read back rather than left over on screen.
  **Red:** as above — failed.

- [x] **Deleting an event and reloading doesn't bring it back.** *(the half this card owns — see below)*
  — `test:` [`tests/05-events-that-stick-around.spec.js` :: Criterion 3](tests/05-events-that-stick-around.spec.js) · red→green ✅
  **Red:** made saving merge with what was already stored instead of replacing it, so removals never took — failed.

- [x] **If the saved data is corrupted or unreadable, the app still opens with an empty calendar rather than a blank, broken screen.**
  — `test:` [`tests/05-events-that-stick-around.spec.js` :: Criterion 4](tests/05-events-that-stick-around.spec.js) · red→green ✅
  Seven tests: six kinds of corruption, plus one good entry beside one bad. Each asserts nothing was thrown on load, a whole working calendar is on screen, nothing was loaded, and a new event can still be added on top.
  **Red:** two separate breaks, because there are two separate guards — removing the guard around parsing failed the "not JSON" case; removing the per-entry check failed four others.

38 tests across the project pass. Run them with `npm test`.

## ⚠️ Two things a reviewer should know

**The corruption tests were weak, and the red proof caught it.** They originally asserted only that no event *chips* were drawn. But a malformed entry has no usable date, so it never lands on a day and never draws a chip — **whether or not it was loaded**. Removing the per-entry validation left four of them green. They now also assert that nothing was *loaded*, which is the thing the guard actually does.

**Criterion 3 is only half-proved here, deliberately.** It needs a delete button, which 🗑️ Changing Your Mind adds. What this card owns — that saving writes the whole list rather than appending, so a removed event stays removed — is proved through the app's own save path. The end-to-end version (press Delete, reload, still gone) is proved in the next card. This is recorded on the card rather than quietly glossed; if you'd rather this card stayed open until then, say so.

## Screenshots

After a genuine reload — the events are read back from storage:

![after reload](plans/prs/assets/05-events-that-stick-around/after-reload.png)

With the stored data deliberately corrupted — a working, empty calendar rather than a broken screen:

![corrupted data](plans/prs/assets/05-events-that-stick-around/corrupted-data.png)

## Links

- Card: [`cards/05-events-that-stick-around.md`](cards/05-events-that-stick-around.md)
- Plan step 5: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it. GitHub shares its numbering between issues and PRs, so there is no PR #4 and the numbers run one ahead of the cards from card 4 onwards.

1. #1 — 🎨 The Look
2. #2 — 🗓️ The Month Grid
3. #3 — ⏭️ Moving Between Months
4. #5 — ✍️ Adding an Event
5. **💾 Events That Stick Around ← you are here**
6. 🗑️ Changing Your Mind — not built yet

Then one feature PR `feature/calendar` → `main` for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
