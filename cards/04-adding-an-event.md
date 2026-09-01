# ✍️ Adding an Event

**Status:** building
**Branch / PR:** <filled by trellis>

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
1. Clicking a day opens a panel to add an event to that specific day, and the
   panel says which day it is.
   - **Verify:** <harvest>
2. I can type a title and a time and save.
   - **Verify:** <harvest>
3. After saving, the event is visible on that day in the grid, and the panel
   closes.
   - **Verify:** <harvest>
4. Saving with an empty title is refused — an error explains why, and no event is
   created.
   - **Verify:** <harvest>
5. The panel can be closed without saving, and nothing is created.
   - **Verify:** <harvest>
6. Several events on the same day all show, in time order.
   - **Verify:** <harvest>

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
