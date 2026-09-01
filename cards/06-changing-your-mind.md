# 🗑️ Changing Your Mind

**Status:** done
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
Everything is driven the way a person would: press an event, type into the
fields, press the buttons.

1. Clicking an existing event opens it with its current title and time already
   filled in. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 1` — opens
     two different events and checks each shows its own details, and that
     pressing the empty part of a day is still "New event", not "Edit".
   - **Red:** opened every event as a blank new one — failed. **Green:** restored.
2. Changing the title or time and saving updates it on the grid, with no
   duplicate left behind. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 2` —
     changes the title, then the time, counting the events on screen each time.
   - **Red:** saved edits as new events instead of changing them — failed, with
     two copies on the grid. **Green:** restored.
3. Changing the time re-sorts it correctly among that day's other events. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 3` — moves
     one of three events to the end of the day, then to the start.
   - **Red:** dropped the sort — failed. **Green:** restored.
4. There is a way to delete an event, and after deleting it is gone from the
   grid. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 4`
   - **Red:** made the final Delete remove nothing — failed. **Green:** restored.
5. Deleting asks for confirmation first, and cancelling leaves the event
   alone. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 5` — the
     first press only asks and hides the normal buttons; *Keep it* puts them
     back; closing while it is asking changes nothing; and reopening the event
     is not still asking.
   - **Red:** two breaks, because this is a negative claim and removing code
     would pass it trivially. Making the first press delete immediately failed
     it; separately, leaving the question showing on reopen failed it too.
     **Green:** restored.
6. Editing to an empty title is refused the same way adding is, and the original
   event is unchanged. ✅
   - **Verify:** `test: tests/06-changing-your-mind.spec.js::Criterion 6` —
     blanks the title *and* changes the time, then checks the refusal and that
     the time change did not sneak through either.
   - **Red:** applied the empty-title guard only to new events — failed.
     **Green:** restored.

### Also tested
- **💾 Events That Stick Around, criterion 3, end to end.** That card could only
  prove the half it owned, because there was no delete button yet. Press Delete,
  reload, still gone — proved here.
  **Red:** stopped saving after a delete — failed, the event came back.
- **An edit survives a reload**, otherwise "changed" would only mean "changed
  until you close the tab".

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
