# 🗓️ The Month Grid

**Status:** in-review
**Branch / PR:** `calendar/02-the-month-grid` · [PR #2](https://github.com/gavinmcdonald97/ai-workflow-test-calendar/pull/2) → `calendar/01-the-look`

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
1. Opening the app shows the current month, named, with the year. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 1` — opens the
     app with the clock pinned to 15 Sep 2026, then again pinned to Jan 2027, so
     the title is proved to follow the clock rather than be hard-coded.
   - **Red:** replaced the title with a fixed string — failed. **Green:** restored.
2. Every day of that month appears exactly once, in the correct weekday column. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 2` — checks
     four awkward months (one starting on a Sunday, a leap February, a 28-day
     February, a 31-day month): the days shown are exactly 1..n, and each cell's
     column matches its real weekday.
   - **Red:** removed the Monday shift so columns landed a day out — failed.
     **Green:** restored.
3. Days from the neighbouring months fill the gaps at the start and end, and are
   visibly quieter than the days of the month being shown. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 3` — uses
     November 2026, which starts on a Sunday and so needs a full six-day gap
     filled. Asserts the gaps really are October and December, that the outside
     days are a different colour, and that they still clear 4.5 against the glass.
   - **Red:** returned only the month's own days, filling no gaps — failed.
     **Green:** restored.
   - The contrast half of this check was fake at first: it read `color`, which
     does not include `opacity`, so re-adding the 0.6 fade left it green. It now
     folds inherited opacity back into the measured colour, and re-adding the
     fade fails it at 2.7. Without that fix the guard proved nothing.
4. Today is clearly marked and visually distinct from every other day. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 4` — exactly
     one cell is marked, it is the right date, and its number really is painted
     with `--color-accent` while no other day is.
   - **Red:** stopped marking today at all — failed. **Green:** restored.
5. It uses The Look's colours and fonts — no new ones invented. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 5` — the
     title, the day numbers and the outside days are compared against the
     resolved token values, not against hard-coded colours. `styles/calendar.css`
     is also covered by card 01's colour-literal check, which now scans every
     stylesheet rather than a fixed list.
   - **Red:** gave the day number its own green and a 21px size — failed.
     **Green:** restored.
6. On a narrow phone-width screen it is still usable and nothing overflows the
   edge of the screen. ✅
   - **Verify:** `test: tests/02-the-month-grid.spec.js::Criterion 6` — at
     375×812: the page does not scroll sideways, no day cell reaches past the
     edge, there are still seven columns, and every cell is at least 44px tall.
   - **Red:** gave the grid a 700px minimum width — failed. **Green:** restored.

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
