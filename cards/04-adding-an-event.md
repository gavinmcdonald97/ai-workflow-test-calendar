# ✍️ Adding an Event

**Status:** understood
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

## Could come later
End times and durations. All-day events. Location, notes and attendees. Colours
or categories per event. Recurring events. Dragging an event to another day.
