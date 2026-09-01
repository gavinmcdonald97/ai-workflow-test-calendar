// 🗑️ Changing Your Mind — proves the six acceptance criteria on
// cards/06-changing-your-mind.md.
//
// Everything is driven the way a person would: press an event, type into the
// fields, press the buttons.

import { test, expect } from "@playwright/test";

const TODAY = new Date(2026, 8, 15, 10, 0, 0); // Tuesday 15 September 2026

async function openCalendar(browser) {
  const page = await browser.newPage({ locale: "en-GB" });
  await page.clock.install({ time: TODAY });
  await page.goto("/index.html");
  return page;
}

const panel = (page) => page.locator("#event-panel");
const heading = (page) => page.locator("#event-panel-title");
const titleField = (page) => page.locator("#event-title");
const timeField = (page) => page.locator("#event-time");
const errorMessage = (page) => page.locator("#event-title-error");

const eventsShownOn = (page, date) =>
  page.$$eval(`.day[data-date="${date}"] .event`, (chips) =>
    chips.map((chip) =>
      [chip.querySelector(".event__time").textContent,
       chip.querySelector(".event__title").textContent].join(" ")
    )
  );

/** Presses the empty part of a day and adds an event there. */
async function addEvent(page, { date, title, time }) {
  await page.locator(`.day[data-date="${date}"] .day__add`).click();
  await titleField(page).fill(title);
  await timeField(page).fill(time);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(panel(page)).toBeHidden();
}

/** Presses an existing event, by its title, to open it. */
async function openEvent(page, title) {
  await page.locator(".event", { hasText: title }).first().click();
  await expect(panel(page)).toBeVisible();
}

// ---------------------------------------------------------------------------
// Criterion 1 — clicking an existing event opens it with its current title and
// time already filled in.
// ---------------------------------------------------------------------------

test("Criterion 1: an existing event opens with its details filled in", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });

  await openEvent(page, "Dentist");
  await expect(heading(page)).toHaveText("Edit event");
  await expect(titleField(page)).toHaveValue("Dentist");
  await expect(timeField(page)).toHaveValue("14:30");
  await expect(page.locator("#event-panel-day")).toHaveText("Thursday 17 September");

  // The other event opens as itself, not as a copy of the first.
  await page.getByRole("button", { name: "Cancel" }).click();
  await openEvent(page, "Standup");
  await expect(titleField(page)).toHaveValue("Standup");
  await expect(timeField(page)).toHaveValue("09:15");

  // And pressing the empty part of a day is still "new", not "edit".
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.locator('.day[data-date="2026-09-19"] .day__add').click();
  await expect(heading(page)).toHaveText("New event");
  await expect(titleField(page)).toHaveValue("");

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 2 — changing the title or time and saving updates it on the grid,
// with no duplicate left behind.
// ---------------------------------------------------------------------------

test("Criterion 2: an edit updates the event and leaves no duplicate", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });

  await openEvent(page, "Dentist");
  await titleField(page).fill("Dentist — check-up");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(panel(page)).toBeHidden();

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["14:30 Dentist — check-up"]);
  expect(await page.locator(".event").count(), "a second copy was left behind").toBe(1);

  // Changing only the time works the same way.
  await openEvent(page, "Dentist");
  await timeField(page).fill("16:45");
  await page.getByRole("button", { name: "Save" }).click();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["16:45 Dentist — check-up"]);
  expect(await page.locator(".event").count()).toBe(1);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 3 — changing the time re-sorts it correctly among that day's other
// events.
// ---------------------------------------------------------------------------

test("Criterion 3: changing the time re-sorts the day", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });
  await addEvent(page, { date: "2026-09-17", title: "Lunch", time: "12:00" });
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });

  expect(await eventsShownOn(page, "2026-09-17"))
    .toEqual(["09:15 Standup", "12:00 Lunch", "14:30 Dentist"]);

  // Move the first one to the end.
  await openEvent(page, "Standup");
  await timeField(page).fill("17:00");
  await page.getByRole("button", { name: "Save" }).click();
  expect(await eventsShownOn(page, "2026-09-17"))
    .toEqual(["12:00 Lunch", "14:30 Dentist", "17:00 Standup"]);

  // And the last one to the start.
  await openEvent(page, "Standup");
  await timeField(page).fill("07:00");
  await page.getByRole("button", { name: "Save" }).click();
  expect(await eventsShownOn(page, "2026-09-17"))
    .toEqual(["07:00 Standup", "12:00 Lunch", "14:30 Dentist"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 4 — there is a way to delete an event, and after deleting it is
// gone from the grid.
// ---------------------------------------------------------------------------

test("Criterion 4: an event can be deleted", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });
  await addEvent(page, { date: "2026-09-17", title: "Lunch", time: "12:00" });

  await openEvent(page, "Lunch");
  await page.locator("#event-delete").click();
  await page.locator("#event-delete-really").click();

  await expect(panel(page)).toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:15 Standup"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 5 — deleting asks for confirmation first, and cancelling leaves the
// event alone.
// ---------------------------------------------------------------------------

test("Criterion 5: deleting asks first, and can be backed out of", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });

  await openEvent(page, "Standup");

  // Pressing Delete only asks — it does not delete.
  await page.locator("#event-delete").click();
  await expect(page.locator("#event-delete-confirm")).toBeVisible();
  await expect(page.locator("#event-actions"),
    "the normal buttons are still there beside the question").toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17"),
    "the event was deleted by the first press").toEqual(["09:15 Standup"]);

  // Backing out puts things back and changes nothing.
  await page.locator("#event-delete-keep").click();
  await expect(page.locator("#event-delete-confirm")).toBeHidden();
  await expect(page.locator("#event-actions")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:15 Standup"]);

  // Closing the panel while it is asking also changes nothing, and the question
  // is not still waiting the next time the event is opened.
  await openEvent(page, "Standup");
  await page.locator("#event-delete").click();
  await page.keyboard.press("Escape");
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:15 Standup"]);

  await openEvent(page, "Standup");
  await expect(page.locator("#event-delete-confirm"),
    "the panel reopened still asking to delete").toBeHidden();

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 6 — editing to an empty title is refused the same way adding is,
// and the original is unchanged.
// ---------------------------------------------------------------------------

test("Criterion 6: an edit to an empty title is refused and changes nothing", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });

  await openEvent(page, "Dentist");
  await titleField(page).fill("   ");
  await timeField(page).fill("08:00");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(errorMessage(page)).toBeVisible();
  await expect(errorMessage(page)).not.toBeEmpty();
  await expect(titleField(page)).toHaveAttribute("aria-invalid", "true");
  await expect(panel(page), "the panel closed on a refused edit").toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();

  // The original is exactly as it was — the time change did not sneak through.
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["14:30 Dentist"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Closing out 💾 Events That Stick Around, criterion 3.
//
// That card could only prove the half it owned — that saving writes the whole
// list rather than appending — because there was no delete button yet. There is
// now, so the whole thing can be proved end to end.
// ---------------------------------------------------------------------------

test("💾 criterion 3: deleting an event and reloading does not bring it back", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Keep me", time: "09:00" });
  await addEvent(page, { date: "2026-09-17", title: "Delete me", time: "11:00" });

  await openEvent(page, "Delete me");
  await page.locator("#event-delete").click();
  await page.locator("#event-delete-really").click();
  await expect(panel(page)).toBeHidden();

  await page.goto("/index.html");
  await page.waitForSelector(".day");

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:00 Keep me"]);
  expect(await page.locator(".event").count(), "the deleted event came back").toBe(1);

  await page.close();
});

// An edit must survive a reload too — otherwise "changed" only means "changed
// until you close the tab".
test("an edit survives a reload", async ({ browser }) => {
  const page = await openCalendar(browser);
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });

  await openEvent(page, "Dentist");
  await titleField(page).fill("Dentist — check-up");
  await timeField(page).fill("16:45");
  await page.getByRole("button", { name: "Save" }).click();

  await page.goto("/index.html");
  await page.waitForSelector(".day");

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["16:45 Dentist — check-up"]);
  expect(await page.locator(".event").count()).toBe(1);

  await page.close();
});
