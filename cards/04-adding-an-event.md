# ✍️ Adding an Event

**Status:** in-review
**Branch / PR:** `calendar/04-adding-an-event` · [PR #5](https://github.com/gavinmcdonald97/ai-workflow-test-calendar/pull/5) → `calendar/03-moving-between-months`

## What it is
Clicking a day, typing a title and a time, saving, and seeing the event appear
on that day in the grid.

## Why it exists
Until now the calendar shows time but holds nothing. This is the point where it
becomes yours — the first moment your own information lives in it.

## How it connects
Needs 🗓️ The Month Grid, since its days are what you click. Uses 🎨 The Look for
the panel, the text box and the button. This card creates the events that
💾 Events That Stick Around saves and 🗑️ Changing Your Mind edits.

## Simplest version (now)
A title and a time on a specific day. Nothing else — no end time, no location,
no notes, no colour.

## Acceptance criteria
Everything is driven the way a person would: click a day, type into the fields,
press the buttons.

1. Clicking a day opens a panel to add an event to that specific day, and the
   panel says which day it is. ✅
   - **Verify:** `test: tests/04-adding-an-event.spec.js::Criterion 1` — opens
     two different days and checks the panel names each one, so it is proved to
     follow the day clicked rather than show something fixed.
   - **Red:** made the panel always name the 17th — failed. **Green:** restored.
2. I can type a title and a time and save. ✅
3. After saving, the event is visible on that day in the grid, and the panel
   closes. ✅
   - **Verify:** `test: tests/04-adding-an-event.spec.js::Criteria 2 and 3` —
     saves an event and checks it appears on that day, on no other day, and that
     the panel has closed.
   - **Red:** saved without redrawing the grid — failed. **Green:** restored.
4. Saving with an empty title is refused — an error explains why, and no event
   is created. ✅
   - **Verify:** `test: tests/04-adding-an-event.spec.js::Criterion 4` — two
     tests: a wholly empty title, and a title of only spaces. Both check the
     message appears, the field is marked invalid, the panel stays open, and
     nothing is created. The second then saves a real title and confirms the
     error clears.
   - **Red:** accepted empty titles — both failed. **Green:** restored.
5. The panel can be closed without saving, and nothing is created. ✅
   - **Verify:** `test: tests/04-adding-an-event.spec.js::Criterion 5` — closes
     with Cancel and with Escape, both with a title already typed in.
   - **Red:** this is a negative case, so removing code would pass it trivially.
     Red came from **forcing the bad thing to happen** — creating the event on
     close as well as on save — which failed it. **Green:** restored.
6. Several events on the same day all show, in time order. ✅
   - **Verify:** `test: tests/04-adding-an-event.spec.js::Criterion 6` — adds
     four events deliberately out of order and checks the order shown.
   - **Red:** dropped the sort, so they showed in the order added — failed.
     **Green:** restored.

### Also tested: the day is not cleared behind the panel's back
A dialog's `close` event fires asynchronously, so clearing the day-being-added-to
in a `close` handler lands *after* the panel has been reopened for another day —
and the next event is saved with no date, existing but appearing nowhere.

Clicking cannot reach this: between two real clicks the browser always runs the
queued `close` event first. The first version of this test used real clicks and
**stayed green** with the bug restored, proving nothing. It now drives the close
and the reopen from a single script, and fails with the handler back in place.
The hazard is real in the code even though the mouse cannot trigger it.

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- `js/events.js` — the events themselves (`events`, `eventsOn`) and the panel
  you add them in. Cards 💾 and 🗑️ will live here too.
- The panel in `index.html` is a native `<dialog>`, so focus handling,
  Escape-to-close and the backdrop come from the browser rather than being
  written here.
- Day cells became `<button>`s, so a day can be opened from the keyboard as well
  as the mouse, and carry their events as chips with the accent down the leading
  edge.
- One click listener on the whole grid rather than one per day, so it keeps
  working as the grid is redrawn.

Titles are put on screen with `textContent`, never `innerHTML`, so a title is
always text and never markup.

**A dialog's `close` event fires asynchronously.** Clearing the day-being-edited
in a `close` handler landed *after* the panel had been reopened for another day,
and the next event was saved with no date at all — it existed but appeared
nowhere. The handler was removed; the day is set every time the panel opens and
only read while it is open.

Time and title are stacked in the chip rather than sitting side by side. Side by
side, a ~100px day cell cut the title to a letter or two — the half you actually
need to recognise the event.

## Could come later
End times and durations. All-day events. Location, notes and attendees. Colours
or categories per event. Recurring events. Dragging an event to another day.
