# 🗓️ The Month Grid

**Status:** building
**Branch / PR:** <filled by trellis>

## What it is
One page of a calendar: a single month laid out on screen, with the right days
in the right weekday columns and today clearly marked. No events on it yet.

## Why it exists
This is the thing you actually look at. It's the spine of the product — every
other feature either changes what month it shows, or puts something on one of
its days. Without it there is no calendar, just data.

## How it connects
Uses 🎨 The Look for all its colours and type. Everything after it hangs off
this: ⏭️ Moving Between Months changes which month it shows, and ✍️ Adding an
Event needs its days to be clickable targets.

## Simplest version (now)
The current month only, rendered correctly, looking good, on desktop and phone.
No navigation, no events, no interaction.

## Acceptance criteria
1. Opening the app shows the current month, named, with the year.
   - **Verify:** <harvest>
2. Every day of that month appears exactly once, in the correct weekday column.
   - **Verify:** <harvest>
3. Days from the neighbouring months fill the gaps at the start and end, and are
   visibly quieter than the days of the month being shown.
   - **Verify:** <harvest>
4. Today is clearly marked and visually distinct from every other day.
   - **Verify:** <harvest>
5. It uses The Look's colours and fonts — no new ones invented.
   - **Verify:** <harvest>
6. On a narrow phone-width screen it is still usable and nothing overflows the
   edge of the screen.
   - **Verify:** <harvest>

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- `index.html` — the calendar page: a glass card holding the month title, the
  weekday strip and the grid of days.
- `js/calendar.js` — `monthGrid(year, month)` works out which days belong on the
  page and is kept apart from `renderMonth(...)`, which draws them. The date
  arithmetic is where calendars usually go wrong, so it can be checked on its
  own.
- `styles/calendar.css` — the grid layout, the day cells, today, and the
  phone-width behaviour. It invents no colours or sizes; everything comes from
  The Look's tokens.

Weeks start on Monday. The page shows only as many whole weeks as it takes to
cover the month, so a short month doesn't get a trailing week belonging entirely
to the next one.

`renderMonth` takes `today` as an argument rather than reading the clock inside
itself. That is the seam the tests use to say what "today" is without moving the
computer's clock — and ⏭️ Moving Between Months needs the same seam to prove
today is only marked in the month it actually falls in.

Days outside the month are set apart by muted text and by having no cell of
their own. An earlier version also faded them with `opacity`, which dropped them
to 2.7 against the glass — under the 4.5 The Look guarantees. The opacity was
removed; the two remaining signals are enough.

## Could come later
Week and day views. Week numbers. Starting the week on Sunday instead of Monday.
Public holidays. A mini month-picker.
