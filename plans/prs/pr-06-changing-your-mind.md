**Plans move and typos happen — events can now be changed or removed.**

## What it is

Clicking an event you already made to change its title or time, or to delete it.

## Why it exists

Without this, a mistyped event is permanent, which makes the calendar something you're wary of putting real things into.

## How it connects

Builds on **#5 (✍️ Adding an Event)** for the events themselves and the panel it reuses, and on **#6 (💾 Events That Stick Around)** so that edits and deletions survive a reload.

This is the last card in the plan.

## Scope

Simplest version only: edit the title and time of one event, or delete it, using the same panel in an editing mode.

Deliberately parked: undo, moving an event to a different day, bulk delete, deleting a whole day's events at once.

## How it's built

- **The panel gained a second mode.** Given an event's id it opens headed "Edit event" with the fields filled in and a Delete button showing; without one it is the "New event" panel from #5. Saving changes the event **in place**, so no second copy is left behind, and the day is not touched — moving an event is parked.
- **Deleting takes two presses.** The first replaces the normal buttons with "Delete this event?" and a choice of *Keep it* or *Delete* — so there is never a Delete and a Save to choose between at the same moment. Only the second press removes anything.
- The empty-title guard from #5 now covers edits too; a refused edit leaves the original exactly as it was.

### ⚠️ The day cell had to be restructured, and the first attempt was wrong

Events are buttons now, and a button inside a button is not allowed, so the "add" surface and the events became siblings. The first version stretched the add surface behind the whole cell — which worked until a day had three events, at which point they **covered it completely** and the day could not have another added.

The day's number now lives *inside* the add surface: it grows to fill whatever the events leave, so an empty day is one big target, but it never shrinks below the number. A full day is still addable.

## Acceptance criteria

- [x] **Clicking an existing event opens it with its current title and time already filled in.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 1](tests/06-changing-your-mind.spec.js) · red→green ✅
  Opens two different events and checks each shows its own details, and that pressing the empty part of a day is still "New event".
  **Red:** opened every event as a blank new one — failed.

- [x] **Changing the title or time and saving updates it on the grid, with no duplicate left behind.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 2](tests/06-changing-your-mind.spec.js) · red→green ✅
  **Red:** saved edits as new events — failed, with two copies on the grid.

- [x] **Changing the time re-sorts it correctly among that day's other events.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 3](tests/06-changing-your-mind.spec.js) · red→green ✅
  Moves one of three events to the end of the day, then to the start.
  **Red:** dropped the sort — failed.

- [x] **There is a way to delete an event, and after deleting it is gone from the grid.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 4](tests/06-changing-your-mind.spec.js) · red→green ✅
  **Red:** made the final Delete remove nothing — failed.

- [x] **Deleting asks for confirmation first, and cancelling leaves the event alone.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 5](tests/06-changing-your-mind.spec.js) · red→green ✅
  The first press only asks and hides the normal buttons; *Keep it* puts them back; closing while it is asking changes nothing; and reopening the event is not still asking.
  **Red:** two breaks, since this is a negative claim. Making the first press delete immediately failed it; separately, leaving the question showing on reopen failed it too.

- [x] **Editing to an empty title is refused the same way adding is, and the original is unchanged.**
  — `test:` [`tests/06-changing-your-mind.spec.js` :: Criterion 6](tests/06-changing-your-mind.spec.js) · red→green ✅
  Blanks the title *and* changes the time, then checks the refusal and that the time change did not sneak through either.
  **Red:** applied the guard only to new events — failed.

**46 tests across the project pass.** Run them with `npm test`.

## This PR closes out #6's criterion 3

💾 Events That Stick Around could only prove the half it owned — that saving writes the whole list rather than appending — because there was no delete button yet. There is now, so it is proved end to end: press Delete, reload, still gone. **Red:** stopped saving after a delete, and the event came back. `cards/05-events-that-stick-around.md` is updated to point at where it is now proved.

An edit surviving a reload is tested too, otherwise "changed" would only mean "changed until you close the tab".

## Three regressions caught while doing this

Two were caught by tests that already existed, which is the argument for having written them:

- **#2's criterion 5 caught the day number turning black.** Moving it inside a `<button>` reset its colour to the browser default — invisible in dark mode.
- **#5 and #6's own helpers caught themselves** clicking day centres that were now event chips. They target `.day__add` now, which is the affordance that means "add".
- **The one no test caught:** `[hidden]` was being overridden by `.panel__actions { display: flex }`, so the confirmation appeared *alongside* the buttons it was meant to replace. Only visible in a screenshot. There is now a global `[hidden] { display: none !important }`.

## Screenshots

Editing an event:

![edit panel](plans/prs/assets/06-changing-your-mind/edit-panel.png)

Deleting asks first, replacing the buttons rather than sitting beside them:

![delete confirmation](plans/prs/assets/06-changing-your-mind/delete-confirm.png)

The finished calendar:

![grid](plans/prs/assets/06-changing-your-mind/grid.png)

## Links

- Card: [`cards/06-changing-your-mind.md`](cards/06-changing-your-mind.md)
- Plan step 6: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it. GitHub shares its numbering between issues and PRs, so there is no PR #4 and the numbers run one ahead of the cards from card 4 onwards.

1. #1 — 🎨 The Look
2. #2 — 🗓️ The Month Grid
3. #3 — ⏭️ Moving Between Months
4. #5 — ✍️ Adding an Event
5. #6 — 💾 Events That Stick Around
6. **🗑️ Changing Your Mind ← you are here**

Once these have merged into `feature/calendar`, one feature PR `feature/calendar` → `main` goes up for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
