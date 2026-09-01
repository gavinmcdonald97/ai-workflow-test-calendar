# Implementation plan: calendar

> Built from the cards in `cards/`. Every step traces back to a card the user
> has already been walked through.

## Scope for this build
A calendar that runs in the browser and shows one month at a time, looking
deliberately designed rather than default. You can move between months and jump
back to today, click a day to add an event with a title and a time, see it on
the grid, edit or delete it, and find it all still there when you come back
tomorrow. Plain HTML, CSS and JavaScript — no framework, no build step, no
server. Events are stored in the browser's own storage on one machine.

Explicitly not included: accounts and login, syncing between devices, week and
day views, recurring events, reminders, dragging events between days, invites,
timezones, integration with Google or Apple Calendar, search, and per-event
categories or colours.

## Cards in this plan
- 🎨 The Look — the colours, type, spacing and components everything is built from
- 🗓️ The Month Grid — one month, laid out correctly, with today marked
- ⏭️ Moving Between Months — forward, back, and home to today
- ✍️ Adding an Event — click a day, type a title and time, see it appear
- 💾 Events That Stick Around — events survive a reload
- 🗑️ Changing Your Mind — edit or delete an existing event

## How this plan is executed
All work sits on the **project trunk** `feature/calendar` (branched from `main`
by Groundwork — the workflow never commits to or merges `main`). One card at a
time: for each step Tend opens the card's branch (`calendar/<nn>-<card-slug>`,
off the previous card's branch, or the project trunk for the first) and writes
the code there; Harvest proves it on the same branch; Trellis opens the card's
PR targeting the card below (or the project trunk). Card PRs merge bottom-up
into the project trunk. Then a check-in with the user before the next step. When
every card PR has merged, one feature PR `feature/calendar` → `main` is opened
for the user to merge. No batching, no one-shotting — however small it looks.

**Note:** this repository has no git remote yet. Until one is added, Trellis can
only do its local half (branches and commits); there will be no PRs to open. Add
a remote before step 1 if you want real PRs from the start.

## Build order

### Step 1 — Design foundation and reference page · Card: 🎨 The Look
- **Goal:** A page you can open that shows the calendar's visual language —
  palette, type at real sizes, and the button, text box and panel as they will
  actually appear — in both light and dark.
- **Technical notes:** `styles/tokens.css` holds every colour, font family, font
  size, spacing step, radius and shadow as CSS custom properties on `:root`,
  with a `@media (prefers-color-scheme: dark)` block redefining only the colour
  tokens. `styles/base.css` holds the reset and element defaults;
  `styles/components.css` holds `.button`, `.field`, `.panel`. `design.html` is
  the reference page and imports exactly those files — no styles of its own.
  Fonts: a serif display face and a sans UI face, each with a real system
  fallback stack, so the page still works offline. No JavaScript in this step.
- **Done when:** 🎨 criteria 1–4.
- **Verified by:** <harvest>
- **PR:** <trellis>

### Step 2 — Render the current month · Card: 🗓️ The Month Grid
- **Goal:** Opening `index.html` shows the current month, correctly laid out and
  looking like the design foundation, with today marked. No interaction yet.
- **Technical notes:** `index.html` plus `js/calendar.js`. A pure function that
  takes a year and month and returns the grid's cells — each cell carrying its
  date and whether it belongs to the shown month — kept separate from the code
  that turns cells into DOM, so the date arithmetic can be tested on its own.
  Weeks start Monday. Leading and trailing cells come from the neighbouring
  months and are rendered muted. CSS Grid for the layout; the phone-width
  behaviour is a media query, not a separate code path. All colours and type
  come from the tokens in step 1 — this step adds no new ones.
- **Done when:** 🗓️ criteria 1–6.
- **Verified by:** <harvest>
- **PR:** <trellis>

### Step 3 — Month navigation and "today" · Card: ⏭️ Moving Between Months
- **Goal:** Previous, next and today controls that move the grid through time
  correctly across year boundaries and leap years.
- **Technical notes:** Hold the displayed year and month as the single piece of
  state and re-render the grid from it, rather than mutating the DOM in place —
  this keeps step 2's rendering function the only thing that draws a month.
  Step forward and back by constructing a new date rather than adding or
  subtracting days, so January and December roll over on their own. The "today"
  marker is decided by comparing a cell's date to the real current date, so it
  simply doesn't appear in other months.
- **Done when:** ⏭️ criteria 1–5.
- **Verified by:** <harvest>
- **PR:** <trellis>

### Step 4 — Add an event to a day · Card: ✍️ Adding an Event
- **Goal:** Clicking a day opens a panel naming that day; a title and a time can
  be saved; the event appears on the day; empty titles are refused; closing
  without saving creates nothing; multiple events on a day show in time order.
- **Technical notes:** Events live in memory for this step as
  `{ id, date, time, title }`, keyed by date, with rendering sorted by time.
  The panel is a native `<dialog>` so focus handling and Escape-to-close come
  for free, styled with step 1's `.panel`, `.field` and `.button`. Validation is
  one guard on save that shows an inline message; the dialog stays open and
  nothing is added. Day clicks are handled by one listener on the grid rather
  than one per cell.
- **Done when:** ✍️ criteria 1–6.
- **Verified by:** <harvest>
- **PR:** <trellis>

### Step 5 — Save events in the browser · Card: 💾 Events That Stick Around
- **Goal:** Events survive a reload, in any month, and corrupted stored data
  degrades to an empty calendar rather than a broken page.
- **Technical notes:** A small storage module with `load()` and `save(events)`
  over `localStorage` under one versioned key. `load()` wraps parsing in
  try/catch and validates the shape, returning an empty list on anything
  unexpected — this is what criterion 4 tests. `save()` is called after every
  change. Step 4's in-memory list becomes the thing that is loaded at startup
  and saved on change; nothing else about step 4 changes.
- **Done when:** 💾 criteria 1–4.
- **Verified by:** <harvest>
- **PR:** <trellis>

### Step 6 — Edit and delete an event · Card: 🗑️ Changing Your Mind
- **Goal:** Clicking an existing event opens it prefilled; saving updates it in
  place and re-sorts by time; deleting asks for confirmation and removes it;
  both changes persist.
- **Technical notes:** Reuse step 4's dialog with an editing mode — the event's
  id decides whether saving adds or replaces. Clicking an event must not also
  trigger the day-click that opens the add panel; the single grid listener
  distinguishes the two targets. Delete confirmation is an explicit confirm step
  in the dialog, and cancelling makes no change. The empty-title guard is the
  same one from step 4, applied to edits, leaving the original untouched.
- **Done when:** 🗑️ criteria 1–6.
- **Verified by:** <harvest>
- **PR:** <trellis>

## Stack
Project trunk: `feature/calendar` (from `main`).
Card PRs, merge order bottom-up into the project trunk:
1. <trellis> — 🎨 The Look
2. <trellis> — 🗓️ The Month Grid
3. <trellis> — ⏭️ Moving Between Months
4. <trellis> — ✍️ Adding an Event
5. <trellis> — 💾 Events That Stick Around
6. <trellis> — 🗑️ Changing Your Mind

Feature PR: <trellis> — `feature/calendar` → `main` (user merges)

## Risks / unknowns
- **No git remote.** Trellis can only do its local half until one exists. Worth
  settling before step 1.
- **"Beautiful" is a judgement, not a test.** The acceptance criteria can prove
  the design foundation is used consistently, is readable and is accessible —
  they cannot prove you like it. Step 1 exists first precisely so you can look
  at the direction and reject it while it is cheap.
- **Web fonts.** If the serif and sans come from a font service, the page needs
  a network connection to look right. Real fallback stacks keep it decent
  offline; if that matters, the fallback becomes the choice.
- **Browser storage is per-browser and per-machine**, and can be cleared by the
  user or the browser. This is understood and accepted for the first version.

## Not now (parked)
Accounts and login · syncing between devices · export, import and backup ·
week and day views · week numbers · starting the week on Sunday · public
holidays · a month/year picker · keyboard shortcuts and swipe gestures ·
animated month transitions · end times, durations and all-day events ·
location, notes and attendees · per-event colours and categories · recurring
events · reminders and notifications · dragging events between days · undo ·
search · a manual light/dark toggle.
