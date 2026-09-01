# 🗑️ Changing Your Mind

**Status:** understood
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

## Could come later
Undo. Moving an event to a different day. Bulk delete. Deleting a whole day's
events at once.
