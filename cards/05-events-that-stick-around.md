# 💾 Events That Stick Around

**Status:** in-review
**Branch / PR:** `calendar/05-events-that-stick-around` · [PR #6](https://github.com/gavinmcdonald97/ai-workflow-test-calendar/pull/6) → `calendar/04-adding-an-event`

## What it is
Your events are still there when you close the tab and come back tomorrow.

## Why it exists
A calendar you have to retype every morning is worse than a piece of paper.
Persistence is the difference between a demo and something you'd actually use.

## How it connects
Needs ✍️ Adding an Event, since there's nothing to save until events exist.
Once this is in place, 🗑️ Changing Your Mind saves its edits and deletions
through the same mechanism.

## Simplest version (now)
Saved in this browser, on this machine, using the browser's own storage. No
account, no server, no syncing between devices.

## Acceptance criteria
Events are added through the real panel and the page is then genuinely reloaded.
Storage is never pre-seeded through `addInitScript`, because that re-runs on
every navigation — including a reload — and would overwrite what the app had
just saved, making "it survived a refresh" pass for the wrong reason.

1. After adding events and reloading the page, they are all still there, on the
   right days, with the right titles and times. ✅
   - **Verify:** `test: tests/05-events-that-stick-around.spec.js::Criterion 1`
   - **Red:** reverted `js/events.js` to the card before this one, which saves
     nothing — failed. **Green:** restored.
2. Events added in a different month are still there when navigating back to
   that month. ✅
   - **Verify:** `test: tests/05-events-that-stick-around.spec.js::Criterion 2` —
     adds in November, reloads, confirms the calendar reopens on September with
     nothing on screen, then navigates back and finds it. So it is proved to be
     read back rather than left over on screen.
   - **Red:** as above — failed. **Green:** restored.
3. Deleting an event and reloading doesn't bring it back. ✅ *(now proved end to
   end — see below)*
   - **Verify:** `test: tests/05-events-that-stick-around.spec.js::Criterion 3` —
     removes an event from the list and saves through the app's own save path,
     then reloads.
   - **Red:** made saving merge with what was already stored instead of
     replacing it, so removals never took — failed. **Green:** restored.
4. If the saved data is corrupted or unreadable, the app still opens with an
   empty calendar rather than a blank, broken screen. ✅
   - **Verify:** `test: tests/05-events-that-stick-around.spec.js::Criterion 4` —
     seven tests: six kinds of corruption, plus one good entry beside one bad.
     Each asserts nothing was thrown on load, a whole working calendar is on
     screen, nothing was loaded, and a new event can still be added on top.
   - **Red:** two separate breaks, because there are two separate guards.
     Removing the guard around parsing failed the "not JSON at all" case;
     removing the per-entry check failed four others.
   - **These tests were weak at first.** They asserted only that no event *chips*
     were drawn — and a malformed entry has no usable date, so it never lands on
     a day and never draws a chip whether or not it was loaded. Removing the
     per-entry check left them green. They now also assert that nothing was
     *loaded*, which is the thing the guard actually does.

### A note on criterion 3
When this card was built there was no delete button, so it could only prove the
half it owned: that saving writes the whole list rather than appending, so an
event taken out of the list really is gone after a reload.

🗑️ Changing Your Mind has since added deleting, and closes this out end to end —
press Delete, reload, still gone — in
`tests/06-changing-your-mind.spec.js::💾 criterion 3`. That test was proved red
by stopping the save after a delete, which brought the event back.

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
Storage lives in `js/events.js` alongside the events themselves, under one
versioned key (`calendar.events.v1`), rather than in a file of its own — the
plan suggested a separate module, but the load and save functions are used
only by the events and the file is still short enough to read in one go.

- `loadEvents()` runs when the page opens, before anything is drawn.
- `saveEvents()` writes the **whole list** back after every change, so removals
  are saved as well as additions.

Unreadable data gives an empty calendar rather than a broken page. The stored
text can be absent, be blocked outright (private browsing), not be JSON at all,
or be JSON of the wrong shape, and every one of those is caught. Entries are
checked individually, so **one bad entry loses that entry, not the whole
calendar**.

## A note on criterion 3
"Deleting an event and reloading doesn't bring it back" needs deleting, which
🗑️ Changing Your Mind delivers — there is no delete button yet. What this card
can and does prove is the part that belongs to it: saving writes the whole list
rather than appending, so an event removed from the list is gone after a reload.
The end-to-end version — press Delete, reload, still gone — is proved in
🗑️ Changing Your Mind.

## Could come later
Syncing between devices. Export and import as a file. Backup. Accounts and
login. Syncing with Google or Apple Calendar.
