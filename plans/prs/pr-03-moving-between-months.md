**Forward, back, and a way home to today — with the year and leap-year edges handled.**

## What it is

Going forward and back through the months, and a way to jump straight back to today.

## Why it exists

A calendar showing only this month can't answer "what am I doing next month" or "when was that thing in July". Being able to move through time — and to get home again without hunting — is what makes it a calendar rather than a picture of one.

## How it connects

Builds on **#2 (🗓️ The Month Grid)**, since it changes which month that grid shows. Uses **#1 (🎨 The Look)** for the buttons.

Once ✍️ Adding an Event exists, this is also how you reach a day in another month to add something to it.

## Scope

Simplest version only: a back control, a forward control, and a Today control. Correct handling of year boundaries and leap years.

Deliberately parked: keyboard shortcuts, swipe gestures on touch screens, jumping straight to a chosen month and year, animating the transition between months.

## How it's built

The month on screen is held as a year and a month — the only thing that changes as you move around — and everything you see is redrawn from that pair rather than the page being edited in place.

`stepMonth` builds the new month as a **date** rather than adding to the month number:

```js
const moved = new Date(shownYear, shownMonth + step, 1);
```

December + 1 becomes January of the next year, and January − 1 becomes December of the previous one, without any of that being written out. The leap-year behaviour falls out the same way.

On a phone the controls drop to their own row rather than squeezing the month name.

## ⚠️ This PR fixes a bug in #2

Today was being marked **wherever it appeared**, including as a neighbouring-month filler day — so looking at August circled the 1st of September sitting in its trailing row. That is exactly what criterion 5 of this card forbids. Today is now marked only when it belongs to the month being shown.

## Acceptance criteria

Every test clicks the real buttons rather than calling the code behind them, so what is proved is what someone using the calendar would actually do.

- [x] **There is a way forward and a way back; using them shows the next or previous month, correctly laid out.**
  — `test:` [`tests/03-moving-between-months.spec.js` :: Criterion 1](tests/03-moving-between-months.spec.js) · red→green ✅
  Forward to October, back to September, back to August; then checks August really has 31 days and every cell still sits in its real weekday column.
  **Red:** made stepping a no-op — failed.

- [x] **Going back from January shows December of the previous year, and going forward from December shows January of the next.**
  — `test:` [`tests/03-moving-between-months.spec.js` :: Criterion 2](tests/03-moving-between-months.spec.js) · red→green ✅
  Crosses the boundary in both directions, twice.
  **Red:** added to the month number instead of building a date, so December + 1 became "month 12" of the same year — failed.

- [x] **February 2028 shows 29 days; February 2027 shows 28.**
  — `test:` [`tests/03-moving-between-months.spec.js` :: Criterion 3](tests/03-moving-between-months.spec.js) · red→green ✅
  Steps into each February from the January before it and counts.
  **Red:** see the note below — the first break didn't work.

- [x] **When looking at a different month, there is a way back to today, and using it returns to the current month with today marked.**
  — `test:` [`tests/03-moving-between-months.spec.js` :: Criterion 4](tests/03-moving-between-months.spec.js) · red→green ✅
  Wanders five months forward across a year boundary, then three months back the other way, using Today from both.
  **Red:** made Today re-show the month already on screen — failed.

- [x] **Today is only marked when looking at the month today actually falls in.**
  — `test:` [`tests/03-moving-between-months.spec.js` :: Criterion 5](tests/03-moving-between-months.spec.js) · red→green ✅
  Two tests. The first checks neighbouring months don't mark today. The second is the one with teeth: with today set to 1 September, it steps back to August, confirms the 1st is on screen as a filler day, and requires it *not* to be marked.
  **Red:** reverting the fix was caught by the filler-day test — see the note below.

21 tests across the project pass. Run them with `npm test`.

## Two red-proof failures worth a reviewer's time

Both are the same lesson: a test that stays green when you break the code is telling you about your test, not your code.

**Hard-coding February to 28 days left criterion 3 green.** That number only sizes how many *weeks* the grid needs; it does not decide which days are shown. The break changed nothing the test could see. Breaking the mechanism that does decide (treating 29 February as not part of the month) failed it properly.

**Reverting the today-marking fix was caught by only one of the two criterion-5 tests.** The general one — "October and August don't mark today" — stayed green, because with today on the 15th it never appears as a filler day anywhere. Only the test that pins today to the 1st caught it. Without that second test the bug would have walked straight back in.

## Screenshots

The controls, on the current month:

![controls](plans/prs/assets/03-moving-between-months/controls.png)

A different month — no day is marked as today:

![another month](plans/prs/assets/03-moving-between-months/another-month.png)

Phone (375px) — the controls take their own row:

![phone](plans/prs/assets/03-moving-between-months/phone.png)

## Links

- Card: [`cards/03-moving-between-months.md`](cards/03-moving-between-months.md)
- Plan step 3: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it:

1. #1 — 🎨 The Look
2. #2 — 🗓️ The Month Grid
3. **⏭️ Moving Between Months ← you are here**
4. ✍️ Adding an Event — not built yet
5. 💾 Events That Stick Around — not built yet
6. 🗑️ Changing Your Mind — not built yet

Then one feature PR `feature/calendar` → `main` for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
