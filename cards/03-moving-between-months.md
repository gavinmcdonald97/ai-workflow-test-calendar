# ⏭️ Moving Between Months

**Status:** building
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
1. There is a way forward and a way back; using them shows the next or previous
   month, correctly laid out.
   - **Verify:** <harvest>
2. Going back from January shows December of the previous year, and going
   forward from December shows January of the next year.
   - **Verify:** <harvest>
3. February 2028 shows 29 days; February 2027 shows 28.
   - **Verify:** <harvest>
4. When looking at a different month, there is a way back to today, and using it
   returns to the current month with today marked.
   - **Verify:** <harvest>
5. Today is only marked when looking at the month today actually falls in.
   - **Verify:** <harvest>

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
