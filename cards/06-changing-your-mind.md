# 🗑️ Changing Your Mind

**Status:** building
**Branch / PR:** <filled by trellis>

## What it is
Clicking an event you already made to change its title or time, or to delete it.

## Why it exists
Plans move and typos happen. Without this, a mistyped event is permanent, which
makes the calendar something you're wary of putting real things into.

## How it connects
Needs ✍️ Adding an Event for events to exist and for the panel it reuses, and
💾 Events That Stick Around so that edits and deletions survive a reload.

## Simplest version (now)
Edit the title and time of one event, or delete it. The same panel used for
adding, in an editing mode.

## Acceptance criteria
1. Clicking an existing event opens it with its current title and time already
   filled in.
   - **Verify:** <harvest>
2. Changing the title or time and saving updates it on the grid, with no
   duplicate left behind.
   - **Verify:** <harvest>
3. Changing the time re-sorts it correctly among that day's other events.
   - **Verify:** <harvest>
4. There is a way to delete an event, and after deleting it is gone from the
   grid.
   - **Verify:** <harvest>
5. Deleting asks for confirmation first, and cancelling leaves the event alone.
   - **Verify:** <harvest>
6. Editing to an empty title is refused the same way adding is, and the original
   event is unchanged.
   - **Verify:** <harvest>

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- The panel gained a second mode. Given an event's id it opens headed "Edit
  event" with the title and time filled in and a Delete button showing; without
  one it is the "New event" panel from ✍️ Adding an Event. Saving changes the
  event **in place**, so no second copy is left behind, and the day is not
  touched — moving an event to another day is parked.
- Deleting takes two presses. The first replaces the normal buttons with
  "Delete this event?" and a choice of *Keep it* or *Delete*, so there is never
  a Delete and a Save to choose between at the same moment. Only the second
  press removes anything.
- The empty-title guard from ✍️ Adding an Event now covers edits as well; a
  refused edit leaves the original exactly as it was.

**The day cell had to be restructured**, as expected since ✍️ Adding an Event.
Events are buttons now, and a button inside a button is not allowed, so the
"add" surface and the events became siblings. The day's number lives inside the
add surface: that surface grows to fill whatever the events leave — an empty day
is one big target — but never shrinks below the number, so **a day full of
events can still have another added**. The first attempt stretched the add
surface behind the whole cell, and the events covered it completely once a day
had three of them.

## Could come later
Undo. Moving an event to a different day. Bulk delete. Deleting a whole day's
events at once.
