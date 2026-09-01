# 💾 Events That Stick Around

**Status:** understood
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

## Could come later
Syncing between devices. Export and import as a file. Backup. Accounts and
login. Syncing with Google or Apple Calendar.
