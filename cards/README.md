# Cards — calendar

A small, carefully designed calendar that runs in the browser. Plain HTML, CSS
and JavaScript, no framework and no build step. Events are stored in your own
browser, on your own machine.

These cards are the human-readable map of the product. They are the shared
language between you and any AI that works on this later — keep them up to date
as understanding changes.

## The cards

| # | Card | What it is |
|---|------|-----------|
| 01 | 🎨 [The Look](01-the-look.md) | The colours, type, spacing and standard components everything else is built from. |
| 02 | 🗓️ [The Month Grid](02-the-month-grid.md) | One page of a calendar — a single month, laid out correctly, with today marked. |
| 03 | ⏭️ [Moving Between Months](03-moving-between-months.md) | Forward, back, and a way to jump home to today. |
| 04 | ✍️ [Adding an Event](04-adding-an-event.md) | Click a day, type a title and time, see it appear. |
| 05 | 💾 [Events That Stick Around](05-events-that-stick-around.md) | Your events are still there tomorrow. |
| 06 | 🗑️ [Changing Your Mind](06-changing-your-mind.md) | Edit or delete an event you already made. |

## How they connect

```
🎨 The Look
     └── everything below uses it
🗓️ The Month Grid
     ├── ⏭️ Moving Between Months   (needs a grid to move)
     └── ✍️ Adding an Event         (needs days to click)
              ├── 💾 Events That Stick Around  (needs events to save)
              └── 🗑️ Changing Your Mind        (needs events to change)
```

🎨 **The Look** is the foundation: it is built first so every later card has a
reference to work from and the UI stays consistent instead of drifting.

🗓️ **The Month Grid** is the spine — it is the thing on screen, and ⏭️, ✍️ and
🗑️ all hang off it.

✍️ **Adding an Event** is where your data first exists. 💾 and 🗑️ both need
events to exist before they mean anything.

## Not now (parked)

Accounts and login · week and day views · recurring events · reminders and
notifications · dragging events between days · invites and attendees ·
timezones · syncing with Google or Apple Calendar · search · categories and
colours per event.
