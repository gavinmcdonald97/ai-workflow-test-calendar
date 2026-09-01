**One page of a calendar: a single month laid out correctly on glass, with today marked.**

## What it is

A single month on screen, with the right days in the right weekday columns and today clearly marked. No events on it yet.

## Why it exists

This is the thing you actually look at. It's the spine of the product — every other feature either changes what month it shows, or puts something on one of its days. Without it there is no calendar, just data.

## How it connects

Builds on **#1 (🎨 The Look)** — every colour, size and font here comes from that card's tokens; this card invents none of its own.

Everything after it hangs off this: ⏭️ Moving Between Months changes which month it shows, and ✍️ Adding an Event needs its days to be clickable targets.

## Scope

Simplest version only: the current month, rendered correctly, on desktop and phone. No navigation, no events, no interaction.

Deliberately parked: week and day views, week numbers, starting the week on Sunday, public holidays, a mini month-picker.

## How it's built

- **`js/calendar.js`** — `monthGrid(year, month)` works out which days belong on the page; `renderMonth(...)` draws them. They are kept apart because date arithmetic is where calendars usually go wrong, and this way it can be checked on its own.
- **`renderMonth` takes `today` as an argument** rather than reading the clock inside itself. That is the seam the tests use to say what "today" is without moving the computer's clock — and ⏭️ Moving Between Months needs the same seam to prove today is only marked in the month it actually falls in.
- Weeks start Monday. Only as many whole weeks as it takes to cover the month are drawn, so a short month doesn't get a trailing week belonging entirely to the next one.
- A plain `<script>` rather than a module, so `index.html` still works if you open it by double-clicking the file.

## Acceptance criteria

- [x] **Opening the app shows the current month, named, with the year.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 1](tests/02-the-month-grid.spec.js) · red→green ✅
  Opens with the clock pinned to Sep 2026, then again to Jan 2027, so the title is proved to follow the clock rather than be hard-coded.
  **Red:** replaced the title with a fixed string — failed.

- [x] **Every day of that month appears exactly once, in the correct weekday column.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 2](tests/02-the-month-grid.spec.js) · red→green ✅
  Checks four awkward months — one starting on a Sunday (hardest case for a Monday-first grid), a leap February, a 28-day February, a 31-day month. The days shown are exactly 1..n, and each cell's column matches its real weekday.
  **Red:** removed the Monday shift so every column landed a day out — failed.

- [x] **Days from the neighbouring months fill the gaps at the start and end, and are visibly quieter.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 3](tests/02-the-month-grid.spec.js) · red→green ✅
  Uses November 2026, which starts on a Sunday and so needs a full six-day gap filled. Asserts the gaps really are October and December, the outside days are a different colour, and they still clear 4.5 against the glass.
  **Red:** returned only the month's own days, filling no gaps — failed.

- [x] **Today is clearly marked and visually distinct from every other day.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 4](tests/02-the-month-grid.spec.js) · red→green ✅
  Exactly one cell is marked, it is the right date, and its number really is painted with `--color-accent` while no other day is.
  **Red:** stopped marking today at all — failed.

- [x] **It uses The Look's colours and fonts — no new ones invented.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 5](tests/02-the-month-grid.spec.js) · red→green ✅
  The title, day numbers and outside days are compared against resolved token values, not hard-coded colours.
  **Red:** gave the day number its own green and a 21px size — failed.

- [x] **On a narrow phone-width screen it is still usable and nothing overflows the edge.**
  — `test:` [`tests/02-the-month-grid.spec.js` :: Criterion 6](tests/02-the-month-grid.spec.js) · red→green ✅
  At 375×812: the page does not scroll sideways, no day cell reaches past the edge, there are still seven columns, and every cell is at least 44px tall.
  **Red:** gave the grid a 700px minimum width — failed.

15 tests across the project pass. Run them with `npm test`.

## ⚠️ Two things worth a reviewer's attention

**An accessibility regression was introduced and removed.** The neighbouring-month days were first faded with `opacity: 0.6`, which drops them to **2.7** against the glass — under the 4.5 that #1 guarantees. The opacity is gone; muted text plus no cell background carry the distinction instead, at 6.3.

**The test guarding that was fake at first.** It read `color`, which does not include `opacity`, so deliberately re-adding the 0.6 fade left the test **green**. It now folds inherited opacity back into the measured colour, and re-adding the fade fails it at 2.7. This is the difference between a guard and the appearance of one.

## Also in this PR

`tests/01-the-look.spec.js` — the "no stylesheet outside `tokens.css` picks a colour of its own" check now scans every stylesheet in `styles/` rather than a hard-coded list, so `calendar.css` (and anything a later card adds) is covered automatically. That is the only change to #1's tests.

## Screenshots

Desktop, light:

![desktop light](plans/prs/assets/02-the-month-grid/desktop-light.png)

Desktop, dark:

![desktop dark](plans/prs/assets/02-the-month-grid/desktop-dark.png)

Phone (375px):

![phone](plans/prs/assets/02-the-month-grid/phone.png)

## Links

- Card: [`cards/02-the-month-grid.md`](cards/02-the-month-grid.md)
- Plan step 2: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it:

1. #1 — 🎨 The Look
2. **🗓️ The Month Grid ← you are here**
3. #3 — ⏭️ Moving Between Months
4. #5 — ✍️ Adding an Event
5. 💾 Events That Stick Around — not built yet
6. 🗑️ Changing Your Mind — not built yet

Then one feature PR `feature/calendar` → `main` for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
