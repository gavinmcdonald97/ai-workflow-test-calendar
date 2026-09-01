**The calendar stops being a display and starts holding your things.**

## What it is

Clicking a day, typing a title and a time, saving, and seeing the event appear on that day in the grid.

## Why it exists

Until now the calendar shows time but holds nothing. This is the point where it becomes yours — the first moment your own information lives in it.

## How it connects

Builds on **#2 (🗓️ The Month Grid)**, whose days are what you click, and uses **#1 (🎨 The Look)** for the panel, the text box and the buttons. **#3 (⏭️ Moving Between Months)** is how you reach a day in another month to add something to it.

This card creates the events that 💾 Events That Stick Around will save and 🗑️ Changing Your Mind will edit.

## Scope

Simplest version only: a title and a time on a specific day. Events live in memory and are gone on reload — #5 fixes that.

Deliberately parked: end times and durations, all-day events, location, notes and attendees, colours or categories per event, recurring events, dragging an event to another day.

## How it's built

- **`js/events.js`** — a new file holding the events (`events`, `eventsOn`) and the panel that creates them. 💾 and 🗑️ will live here too.
- **The panel is a native `<dialog>`**, so focus handling, Escape-to-close and the backdrop come from the browser rather than being written here.
- **Day cells became `<button>`s**, so a day can be opened from the keyboard as well as the mouse.
- **One click listener on the whole grid** rather than one per day, so it keeps working as the grid is redrawn.
- Titles go on screen with `textContent`, never `innerHTML` — a title is text, never markup.

**Time is stacked above title in the chip, not beside it.** Side by side, a ~100px day cell cut "09:15 Standup" down to "09:15 S…" — losing exactly the half you need to recognise the event.

## Acceptance criteria

Everything is driven the way a person would: click a day, type into the fields, press the buttons.

- [x] **Clicking a day opens a panel to add an event to that specific day, and the panel says which day it is.**
  — `test:` [`tests/04-adding-an-event.spec.js` :: Criterion 1](tests/04-adding-an-event.spec.js) · red→green ✅
  Opens two different days and checks the panel names each, so it is proved to follow the day clicked.
  **Red:** made the panel always name the 17th — failed.

- [x] **I can type a title and a time and save.**
- [x] **After saving, the event is visible on that day in the grid, and the panel closes.**
  — `test:` [`tests/04-adding-an-event.spec.js` :: Criteria 2 and 3](tests/04-adding-an-event.spec.js) · red→green ✅
  Checks it appears on that day, on no other day, and that the panel has closed.
  **Red:** saved without redrawing the grid — failed.

- [x] **Saving with an empty title is refused — an error explains why, and no event is created.**
  — `test:` [`tests/04-adding-an-event.spec.js` :: Criterion 4](tests/04-adding-an-event.spec.js) · red→green ✅
  Two tests: a wholly empty title and a title of only spaces. Both check the message appears, the field is marked invalid, the panel stays open, and nothing is created. The second then saves a real title and confirms the error clears.
  **Red:** accepted empty titles — both failed.

- [x] **The panel can be closed without saving, and nothing is created.**
  — `test:` [`tests/04-adding-an-event.spec.js` :: Criterion 5](tests/04-adding-an-event.spec.js) · red→green ✅
  Closes with Cancel and with Escape, both with a title already typed in.
  **Red:** this is a negative claim, so deleting code passes it trivially. Red came from **forcing the bad thing to happen** — creating the event on close as well as on save — which failed it.

- [x] **Several events on the same day all show, in time order.**
  — `test:` [`tests/04-adding-an-event.spec.js` :: Criterion 6](tests/04-adding-an-event.spec.js) · red→green ✅
  Adds four events deliberately out of order and checks the order shown.
  **Red:** dropped the sort — failed.

28 tests across the project pass. Run them with `npm test`.

## ⚠️ A regression test that was worthless, and how it was fixed

While building this card an event saved with **no date** and vanished from the calendar. The cause is real: a `<dialog>`'s `close` event fires **asynchronously**, so clearing the day-being-added-to in a `close` handler lands *after* the panel has been reopened for another day. The handler was removed.

The regression test written for it was then proved worthless: restoring the bug left it **green**. Between two real clicks the browser always runs the queued `close` event first, so the mouse cannot reach the race — the original failure only happened because the page was being driven from a script.

The test now drives close-and-reopen from a single script and fails properly with the handler back in place. Worth being precise about what this means: the hazard is genuine in the code, but the user-facing bug it looked like was not reachable by clicking.

## Screenshots

The grid, with events:

![grid with events](plans/prs/assets/04-adding-an-event/grid-with-events.png)

The panel:

![panel](plans/prs/assets/04-adding-an-event/panel.png)

An empty title, refused — marked by the outline *and* the message, never by colour alone:

![empty title refused](plans/prs/assets/04-adding-an-event/empty-title-refused.png)

Dark:

![dark](plans/prs/assets/04-adding-an-event/grid-dark.png)

## Links

- Card: [`cards/04-adding-an-event.md`](cards/04-adding-an-event.md)
- Plan step 4: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it:

1. #1 — 🎨 The Look
2. #2 — 🗓️ The Month Grid
3. #3 — ⏭️ Moving Between Months
4. **✍️ Adding an Event ← you are here**
5. 💾 Events That Stick Around — not built yet
6. 🗑️ Changing Your Mind — not built yet

Then one feature PR `feature/calendar` → `main` for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
