# 💾 Events That Stick Around

**Status:** building
**Branch / PR:** <filled by trellis>

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
1. After adding events and reloading the page, they are all still there, on the
   right days, with the right titles and times.
   - **Verify:** <harvest>
2. Events added in a different month are still there when navigating back to
   that month.
   - **Verify:** <harvest>
3. Deleting an event and reloading does not bring it back.
   - **Verify:** <harvest>
4. If the saved data is corrupted or unreadable, the app still opens with an
   empty calendar rather than a blank, broken screen.
   - **Verify:** <harvest>

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
