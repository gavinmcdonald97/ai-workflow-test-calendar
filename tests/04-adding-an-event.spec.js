// ✍️ Adding an Event — proves the six acceptance criteria on
// cards/04-adding-an-event.md.
//
// Everything is driven the way a person would: click a day, type into the
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
const titleField = (page) => page.locator("#event-title");
const timeField = (page) => page.locator("#event-time");
const errorMessage = (page) => page.locator("#event-title-error");
const day = (page, date) => page.locator(`.day[data-date="${date}"]`);

/** What is written on a day, as ["09:15 Standup", ...] in the order shown. */
const eventsShownOn = (page, date) =>
  page.$$eval(`.day[data-date="${date}"] .event`, (chips) =>
    chips.map((chip) =>
      [chip.querySelector(".event__time").textContent,
       chip.querySelector(".event__title").textContent].join(" ")
    )
  );

/** Clicks a day, fills the panel in and saves. */
async function addEvent(page, { date, title, time }) {
  await day(page, date).click();
  await titleField(page).fill(title);
  await timeField(page).fill(time);
  await page.getByRole("button", { name: "Save" }).click();
}

// ---------------------------------------------------------------------------
// Criterion 1 — clicking a day opens a panel to add an event to that specific
// day, and the panel says which day it is.
// ---------------------------------------------------------------------------

test("Criterion 1: clicking a day opens a panel naming that day", async ({ browser }) => {
  const page = await openCalendar(browser);

  await expect(panel(page)).toBeHidden();

  await day(page, "2026-09-17").click();
  await expect(panel(page)).toBeVisible();
  await expect(page.locator("#event-panel-day")).toHaveText("Thursday 17 September");

  // A different day names that day instead — the panel really follows the
  // day clicked rather than showing something fixed.
  await page.getByRole("button", { name: "Cancel" }).click();
  await day(page, "2026-09-03").click();
  await expect(page.locator("#event-panel-day")).toHaveText("Thursday 3 September");

  await page.close();
});

// ---------------------------------------------------------------------------
// Criteria 2 and 3 — a title and a time can be saved; afterwards the event is
// visible on that day and the panel has closed.
// ---------------------------------------------------------------------------

test("Criteria 2 and 3: saving puts the event on the day and closes the panel", async ({ browser }) => {
  const page = await openCalendar(browser);

  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });

  await expect(panel(page)).toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["14:30 Dentist"]);

  // And only on that day.
  expect(await eventsShownOn(page, "2026-09-16")).toEqual([]);
  expect(await eventsShownOn(page, "2026-09-18")).toEqual([]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 4 — saving with an empty title is refused: an error explains why,
// and no event is created.
// ---------------------------------------------------------------------------

test("Criterion 4: an empty title is refused and nothing is created", async ({ browser }) => {
  const page = await openCalendar(browser);

  await day(page, "2026-09-17").click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(errorMessage(page)).toBeVisible();
  await expect(errorMessage(page)).not.toBeEmpty();
  await expect(titleField(page)).toHaveAttribute("aria-invalid", "true");
  await expect(panel(page), "the panel closed on a refused save").toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual([]);

  await page.close();
});

test("Criterion 4: a title of only spaces is refused too", async ({ browser }) => {
  const page = await openCalendar(browser);

  await day(page, "2026-09-17").click();
  await titleField(page).fill("   ");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(errorMessage(page)).toBeVisible();
  await expect(panel(page)).toBeVisible();

  // And the same panel then accepts a real title, clearing the error.
  await titleField(page).fill("Dentist");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(panel(page)).toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:00 Dentist"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 5 — the panel can be closed without saving, and nothing is created.
// ---------------------------------------------------------------------------

test("Criterion 5: closing without saving creates nothing", async ({ browser }) => {
  const page = await openCalendar(browser);

  // Cancel, with a title typed in — the tempting case to get wrong.
  await day(page, "2026-09-17").click();
  await titleField(page).fill("Should not exist");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(panel(page)).toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual([]);

  // Escape, likewise.
  await day(page, "2026-09-17").click();
  await titleField(page).fill("Should also not exist");
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
  expect(await eventsShownOn(page, "2026-09-17")).toEqual([]);

  // Nothing anywhere on the calendar.
  expect(await page.locator(".event").count()).toBe(0);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 6 — several events on the same day all show, in time order.
// ---------------------------------------------------------------------------

test("Criterion 6: several events on a day show in time order", async ({ browser }) => {
  const page = await openCalendar(browser);

  // Added deliberately out of order.
  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });
  await addEvent(page, { date: "2026-09-17", title: "Lunch", time: "12:00" });
  await addEvent(page, { date: "2026-09-17", title: "Early start", time: "07:00" });

  expect(await eventsShownOn(page, "2026-09-17")).toEqual([
    "07:00 Early start",
    "09:15 Standup",
    "12:00 Lunch",
    "14:30 Dentist",
  ]);

  await page.close();
});

// ---------------------------------------------------------------------------
// A regression test for a hazard found while building this card.
//
// A dialog's `close` event fires asynchronously. Clearing the day-being-added-to
// in a `close` handler lands *after* the panel has been reopened for another
// day, so the next event is saved with no date at all — it exists, but appears
// nowhere on the calendar.
//
// Clicking cannot reach this: between two real clicks the browser always gets
// to run the queued `close` event first. It needs the close and the reopen to
// happen in one go, which is why this test drives them from a single script
// rather than through the mouse. The hazard is real in the code even though the
// mouse cannot trigger it, and this is what keeps the handler from coming back.
// ---------------------------------------------------------------------------

test("the day being added to is not cleared behind the panel's back", async ({ browser }) => {
  const page = await openCalendar(browser);

  await page.evaluate(() => {
    const panel = document.querySelector("#event-panel");

    // Open one day, close it, and open another with no pause in between.
    document.querySelector('.day[data-date="2026-09-10"]').click();
    panel.close();
    document.querySelector('.day[data-date="2026-09-21"]').click();
  });

  await titleField(page).fill("Haircut");
  await timeField(page).fill("11:00");
  await page.getByRole("button", { name: "Save" }).click();

  expect(await eventsShownOn(page, "2026-09-21")).toEqual(["11:00 Haircut"]);
  expect(await eventsShownOn(page, "2026-09-10")).toEqual([]);
  // The event landed on a day, rather than being saved with no day and
  // vanishing from the calendar entirely.
  expect(await page.locator(".event").count(), "the event was saved with no day").toBe(1);

  await page.close();
});
