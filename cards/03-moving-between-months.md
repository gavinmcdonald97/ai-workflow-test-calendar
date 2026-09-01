# ⏭️ Moving Between Months

**Status:** done
**Branch / PR:** <filled by trellis>

## What it is
Going forward and back through the months, and a way to jump straight back to
today.

## Why it exists
A calendar showing only this month can't answer "what am I doing next month" or
"when was that thing in July". Being able to move through time — and to get
home again without hunting — is what makes it a calendar rather than a picture
of one.

## How it connects
Needs 🗓️ The Month Grid to exist, since it changes which month that grid shows.
Once ✍️ Adding an Event exists, this is also how you reach a day in another
month to add something to it.

## Simplest version (now)
A previous control, a next control, and a "today" control. Correct handling of
year boundaries and leap years.

## Acceptance criteria
Every test clicks the real buttons rather than calling the code behind them, so
what is proved is what someone using the calendar would actually do.

1. There is a way forward and a way back; using them shows the next or previous
   month, correctly laid out. ✅
   - **Verify:** `test: tests/03-moving-between-months.spec.js::Criterion 1` —
     forward to October, back to September, back to August; then checks August
     really has 31 days and every cell still sits in its real weekday column.
   - **Red:** made stepping a no-op — failed. **Green:** restored.
2. Going back from January shows December of the previous year, and going
   forward from December shows January of the next year. ✅
   - **Verify:** `test: tests/03-moving-between-months.spec.js::Criterion 2` —
     crosses the boundary in both directions, twice.
   - **Red:** added to the month number instead of building a date, so December
     + 1 became "month 12" of the same year — failed. **Green:** restored.
3. February 2028 shows 29 days; February 2027 shows 28. ✅
   - **Verify:** `test: tests/03-moving-between-months.spec.js::Criterion 3` —
     steps into each February from the January before it and counts.
   - **Red:** the first break — hard-coding February to 28 days — left the test
     **green**, because that number only sizes the number of weeks and does not
     decide which days are shown. Breaking the mechanism that does (treating 29
     February as not part of the month) failed it. **Green:** restored.
4. When looking at a different month, there is a way back to today, and using it
   returns to the current month with today marked. ✅
   - **Verify:** `test: tests/03-moving-between-months.spec.js::Criterion 4` —
     wanders five months forward across a year boundary, then three months back
     the other way, using Today from both.
   - **Red:** made Today re-show the month already on screen — failed.
     **Green:** restored.
5. Today is only marked when looking at the month today actually falls in. ✅
   - **Verify:** `test: tests/03-moving-between-months.spec.js::Criterion 5` —
     two tests. The first checks neighbouring months don't mark today. The
     second is the one with teeth: with today set to 1 September, it steps back
     to August, confirms the 1st of September is on screen as a filler day, and
     requires it *not* to be marked.
   - **Red:** reverted the fix so today was marked wherever it appeared — the
     general test still passed, the filler-day test failed. **Green:** restored.
   - This is the bug this card found in 🗓️ The Month Grid: looking at August
     circled the 1st of September sitting in its trailing row. The general test
     alone would not have caught it.

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- Three controls in the calendar header: back, **Today**, forward. On a phone
  they drop to their own row rather than squeezing the month name.
- `js/calendar.js` gained the month that is showing (`shownYear`, `shownMonth`)
  as the only thing that changes as you move around, plus `showMonth`,
  `stepMonth` and `showToday`. Everything on screen is redrawn from that pair,
  rather than the page being edited in place.

`stepMonth` builds the new month as a date rather than adding to the month
number, so December + 1 becomes January of the next year and January - 1 becomes
December of the previous one, without any of that being written out.

**This card tightened 🗓️ The Month Grid.** Today was being marked wherever it
appeared, including as a neighbouring-month day — so looking at August circled
the 1st of September sitting in its trailing row. Today is now marked only when
it belongs to the month being shown, which is what criterion 5 asks for.

## Could come later
Keyboard shortcuts. Swipe gestures on touch screens. Jumping straight to a
chosen month and year. Animating the transition between months.
