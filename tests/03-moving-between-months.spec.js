// ⏭️ Moving Between Months — proves the five acceptance criteria on
// cards/03-moving-between-months.md.
//
// Every test drives the real buttons rather than calling the code behind them,
// so what is proved is what someone using the calendar would actually do.

import { test, expect } from "@playwright/test";

const TODAY = new Date(2026, 8, 15, 10, 0, 0); // Tuesday 15 September 2026

async function openCalendar(browser, today = TODAY) {
  const page = await browser.newPage({ locale: "en-GB" });
  await page.clock.install({ time: today });
  await page.goto("/index.html");
  return page;
}

const title = (page) => page.locator("#month-title");
const back = (page) => page.getByRole("button", { name: "Previous month" });
const forward = (page) => page.getByRole("button", { name: "Next month" });
const todayButton = (page) => page.getByRole("button", { name: "Today" });

/** The dates of the days belonging to the month being shown. */
const daysOfMonth = (page) =>
  page.$$eval(".day:not(.day--outside)", (cells) => cells.map((c) => c.dataset.date));

/** The dates of any day marked as today. */
const markedToday = (page) =>
  page.$$eval(".day--today", (cells) => cells.map((c) => c.dataset.date));

// ---------------------------------------------------------------------------
// Criterion 1 — there is a way forward and a way back; using them shows the
// next or previous month, correctly laid out.
// ---------------------------------------------------------------------------

test("Criterion 1: forward and back show the next and previous month", async ({ browser }) => {
  const page = await openCalendar(browser);
  await expect(title(page)).toHaveText("September 2026");

  await forward(page).click();
  await expect(title(page)).toHaveText("October 2026");

  await back(page).click();
  await expect(title(page)).toHaveText("September 2026");

  await back(page).click();
  await expect(title(page)).toHaveText("August 2026");

  // Correctly laid out, not just correctly named: August has 31 days, and every
  // cell still sits in its real weekday column.
  const days = await daysOfMonth(page);
  expect(days).toHaveLength(31);
  expect(days[0]).toBe("2026-08-01");
  expect(days.at(-1)).toBe("2026-08-31");

  const cells = await page.$$eval(".day", (all) => all.map((c) => c.dataset.date));
  cells.forEach((date, position) => {
    const weekday = (new Date(`${date}T00:00:00`).getDay() + 6) % 7; // Monday is 0
    expect(position % 7, `${date} is in the wrong column`).toBe(weekday);
  });

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 2 — going back from January shows December of the previous year,
// and going forward from December shows January of the next year.
// ---------------------------------------------------------------------------

test("Criterion 2: the year rolls over at January and December", async ({ browser }) => {
  const page = await openCalendar(browser, new Date(2027, 0, 10)); // January 2027
  await expect(title(page)).toHaveText("January 2027");

  await back(page).click();
  await expect(title(page)).toHaveText("December 2026");
  expect(await daysOfMonth(page)).toHaveLength(31);

  await forward(page).click();
  await expect(title(page)).toHaveText("January 2027");

  // And the other way round, from December.
  await back(page).click();
  await expect(title(page)).toHaveText("December 2026");
  await forward(page).click();
  await expect(title(page)).toHaveText("January 2027");

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 3 — February 2028 shows 29 days; February 2027 shows 28.
// ---------------------------------------------------------------------------

test("Criterion 3: February has the right number of days in a leap year", async ({ browser }) => {
  const leapYear = await openCalendar(browser, new Date(2028, 0, 10)); // January 2028
  await forward(leapYear).click();
  await expect(title(leapYear)).toHaveText("February 2028");
  expect(await daysOfMonth(leapYear)).toHaveLength(29);
  expect((await daysOfMonth(leapYear)).at(-1)).toBe("2028-02-29");

  const ordinaryYear = await openCalendar(browser, new Date(2027, 0, 10)); // January 2027
  await forward(ordinaryYear).click();
  await expect(title(ordinaryYear)).toHaveText("February 2027");
  expect(await daysOfMonth(ordinaryYear)).toHaveLength(28);
  expect((await daysOfMonth(ordinaryYear)).at(-1)).toBe("2027-02-28");

  await leapYear.close();
  await ordinaryYear.close();
});

// ---------------------------------------------------------------------------
// Criterion 4 — from a different month there is a way back to today, and using
// it returns to the current month with today marked.
// ---------------------------------------------------------------------------

test("Criterion 4: Today brings you back to the current month", async ({ browser }) => {
  const page = await openCalendar(browser);

  // Wander a long way off, forwards and across a year boundary.
  for (let click = 0; click < 5; click++) await forward(page).click();
  await expect(title(page)).toHaveText("February 2027");
  expect(await markedToday(page)).toEqual([]);

  await todayButton(page).click();
  await expect(title(page)).toHaveText("September 2026");
  expect(await markedToday(page)).toEqual(["2026-09-15"]);

  // And back from the other direction.
  for (let click = 0; click < 3; click++) await back(page).click();
  await expect(title(page)).toHaveText("June 2026");

  await todayButton(page).click();
  await expect(title(page)).toHaveText("September 2026");
  expect(await markedToday(page)).toEqual(["2026-09-15"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 5 — today is only marked when looking at the month today actually
// falls in.
// ---------------------------------------------------------------------------

test("Criterion 5: today is marked only in its own month", async ({ browser }) => {
  const page = await openCalendar(browser);
  expect(await markedToday(page)).toEqual(["2026-09-15"]);

  await forward(page).click();
  await expect(title(page)).toHaveText("October 2026");
  expect(await markedToday(page), "October should not mark today").toEqual([]);

  await back(page).click();
  await back(page).click();
  await expect(title(page)).toHaveText("August 2026");
  expect(await markedToday(page), "August should not mark today").toEqual([]);

  await page.close();
});

// The trap this criterion is really about: when today is the 1st or the last of
// a month, it also appears in the neighbouring month's grid as a filler day.
// Marking it there would mean today was highlighted while looking at a month it
// does not belong to.
test("Criterion 5: today is not marked where it appears as a filler day", async ({ browser }) => {
  // 1 September 2026 is a Tuesday, so it sits in August's trailing row.
  const page = await openCalendar(browser, new Date(2026, 8, 1, 10, 0, 0));
  await expect(title(page)).toHaveText("September 2026");
  expect(await markedToday(page)).toEqual(["2026-09-01"]);

  await back(page).click();
  await expect(title(page)).toHaveText("August 2026");

  // The 1st of September is on screen — as a filler day — but must not be
  // marked, because we are looking at August.
  const onScreen = await page.$$eval(".day", (cells) => cells.map((c) => c.dataset.date));
  expect(onScreen, "the 1st of September should be visible in August's grid")
    .toContain("2026-09-01");
  expect(await markedToday(page), "August marked a day belonging to September").toEqual([]);

  await page.close();
});
