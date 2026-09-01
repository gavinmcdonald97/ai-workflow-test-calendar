// 🗓️ The Month Grid — proves the six acceptance criteria on
// cards/02-the-month-grid.md.

import { test, expect } from "@playwright/test";
import { composite, contrastRatio } from "./contrast.js";

// A fixed "today" so the tests say the same thing every day of the year.
const TODAY = new Date(2026, 8, 15, 10, 0, 0); // Tuesday 15 September 2026

/** Opens the calendar with the clock and language pinned, so results don't
    depend on when or where the test runs. */
async function openCalendar(browser, { today = TODAY, viewport, colorScheme } = {}) {
  const page = await browser.newPage({ locale: "en-GB", viewport, colorScheme });
  await page.clock.install({ time: today });
  await page.goto("/index.html");
  return page;
}

/** The day cells on screen, in reading order. */
async function readGrid(page) {
  return page.$$eval(".day", (cells) =>
    cells.map((cell) => ({
      date: cell.dataset.date,
      number: cell.querySelector(".day__number").textContent,
      outside: cell.classList.contains("day--outside"),
      today: cell.classList.contains("day--today"),
    }))
  );
}

// ---------------------------------------------------------------------------
// Criterion 1 — opening the app shows the current month, named, with the year.
// ---------------------------------------------------------------------------

test("Criterion 1: opening the app shows the current month, named, with the year", async ({ browser }) => {
  const page = await openCalendar(browser);

  await expect(page.locator("#month-title")).toHaveText("September 2026");

  // It really is following the clock, not a hard-coded string.
  const january = await openCalendar(browser, { today: new Date(2027, 0, 4) });
  await expect(january.locator("#month-title")).toHaveText("January 2027");

  await page.close();
  await january.close();
});

// ---------------------------------------------------------------------------
// Criterion 2 — every day of the month appears exactly once, in the correct
// weekday column.
// ---------------------------------------------------------------------------

test("Criterion 2: every day appears exactly once, in the right weekday column", async ({ browser }) => {
  const page = await openCalendar(browser);

  // Months chosen to cover the awkward shapes: one starting on a Sunday (the
  // hardest case for a Monday-first grid), a leap February, a 28-day February,
  // and a 31-day month.
  const months = [
    { year: 2026, month: 10, name: "November 2026 (starts Sunday)", days: 30 },
    { year: 2028, month: 1, name: "February 2028 (leap year)", days: 29 },
    { year: 2027, month: 1, name: "February 2027", days: 28 },
    { year: 2026, month: 11, name: "December 2026", days: 31 },
  ];

  for (const { year, month, name, days } of months) {
    await page.evaluate(([y, m]) => renderMonth(y, m), [year, month]);
    const cells = await readGrid(page);

    const inMonth = cells.filter((cell) => !cell.outside);
    expect(inMonth.map((cell) => Number(cell.number)), `${name}: the days shown`)
      .toEqual(Array.from({ length: days }, (_, i) => i + 1));

    // The grid is whole Monday-to-Sunday weeks, so a cell's column is just its
    // position within a row of seven.
    cells.forEach((cell, position) => {
      const column = position % 7;
      // Monday is column 0. getDay() calls Sunday 0, so shift it round.
      const weekday = (new Date(`${cell.date}T00:00:00`).getDay() + 6) % 7;
      expect(column, `${name}: ${cell.date} is in the wrong column`).toBe(weekday);
    });

    expect(cells.length % 7, `${name}: the grid is not whole weeks`).toBe(0);
  }

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 3 — days from the neighbouring months fill the gaps, and are
// visibly quieter than the days of the month being shown.
// ---------------------------------------------------------------------------

test("Criterion 3: neighbouring months fill the gaps and are quieter", async ({ browser }) => {
  const page = await openCalendar(browser);

  // November 2026 starts on a Sunday, so there is a full six-day gap to fill
  // at the start — the most demanding case.
  await page.evaluate(() => renderMonth(2026, 10));
  const cells = await readGrid(page);

  const firstInMonth = cells.findIndex((cell) => !cell.outside);
  const lastInMonth = cells.findLastIndex((cell) => !cell.outside);

  expect(firstInMonth, "no gap was filled at the start").toBeGreaterThan(0);
  expect(lastInMonth, "no gap was filled at the end").toBeLessThan(cells.length - 1);

  // The gaps really are the neighbouring months, in order, with no holes.
  for (const cell of cells.slice(0, firstInMonth)) {
    expect(cell.date.startsWith("2026-10"), `${cell.date} should be October`).toBe(true);
  }
  for (const cell of cells.slice(lastInMonth + 1)) {
    expect(cell.date.startsWith("2026-12"), `${cell.date} should be December`).toBe(true);
  }

  // Quieter: a different, dimmer colour than the days of this month.
  const colourOf = (selector) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).color);
  const insideColour = await colourOf(".day:not(.day--outside):not(.day--today) .day__number");
  const outsideColour = await colourOf(".day--outside .day__number");
  expect(outsideColour).not.toBe(insideColour);

  // But still readable. `color` on its own is not what you see — `opacity` on
  // the element or any ancestor fades it further, and an earlier version of the
  // grid used exactly that to drop these days to 2.7 against the glass. So the
  // colour is measured with the inherited opacity folded back in.
  const { colour, alpha } = await page
    .locator(".day--outside .day__number")
    .first()
    .evaluate((el) => {
      let alpha = 1;
      for (let node = el; node; node = node.parentElement) {
        alpha *= Number(getComputedStyle(node).opacity);
      }
      return { colour: getComputedStyle(el).color, alpha };
    });

  const [red, green, blue] = colour.match(/[\d.]+/g).slice(0, 3);
  const asSeen = `rgb(${red} ${green} ${blue} / ${alpha * 100}%)`;

  const glassFill = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--glass-fill").trim()
  );
  const washes = await page.evaluate(() =>
    ["--backdrop-base", "--backdrop-wash-1", "--backdrop-wash-2", "--backdrop-wash-3"].map(
      (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    )
  );

  const worst = Math.min(
    ...washes.map((wash) => {
      const background = composite(glassFill, wash);
      // The faded text sits on that background, so composite it there too.
      return contrastRatio(composite(asSeen, `rgb(${background.join(" ")})`), background);
    })
  );
  expect(worst, "neighbouring-month days are too faint to read").toBeGreaterThanOrEqual(4.5);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 4 — today is clearly marked and visually distinct from every other
// day.
// ---------------------------------------------------------------------------

test("Criterion 4: today is marked, and only today", async ({ browser }) => {
  const page = await openCalendar(browser);

  const cells = await readGrid(page);
  const marked = cells.filter((cell) => cell.today);

  expect(marked).toHaveLength(1);
  expect(marked[0].date).toBe("2026-09-15");

  // Distinct to look at, not just in the markup: today's number is painted with
  // the accent, and no other day is.
  const backgroundOf = (selector) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor);

  const todayBackground = await backgroundOf(".day--today .day__number");
  const ordinaryBackground = await backgroundOf(".day:not(.day--today) .day__number");
  expect(todayBackground).not.toBe(ordinaryBackground);

  const accent = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent").trim();
    document.body.append(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  });
  expect(todayBackground).toBe(accent);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 5 — it uses The Look's colours and fonts; no new ones invented.
// ---------------------------------------------------------------------------

test("Criterion 5: the grid uses The Look's colours and fonts", async ({ browser }) => {
  const page = await openCalendar(browser);

  // Resolves a token to the same form getComputedStyle reports, so the two can
  // be compared directly.
  const resolved = (property, token) =>
    page.evaluate(([prop, name]) => {
      const probe = document.createElement("div");
      probe.style[prop] = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      document.body.append(probe);
      const value = getComputedStyle(probe)[prop];
      probe.remove();
      return value;
    }, [property, token]);

  const title = page.locator("#month-title");
  const ordinaryNumber = page.locator(".day:not(.day--outside):not(.day--today) .day__number").first();
  const outsideNumber = page.locator(".day--outside .day__number").first();

  await expect(title).toHaveCSS("font-family", await resolved("fontFamily", "--font-ui"));
  await expect(title).toHaveCSS("font-size", "40px");   // --text-2xl
  await expect(ordinaryNumber).toHaveCSS("color", await resolved("color", "--color-ink"));
  await expect(ordinaryNumber).toHaveCSS("font-size", "20px"); // --text-lg
  await expect(outsideNumber).toHaveCSS("color", await resolved("color", "--color-ink-muted"));

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 6 — on a narrow phone-width screen it is still usable and nothing
// overflows the edge of the screen.
// ---------------------------------------------------------------------------

test("Criterion 6: it works at phone width without overflowing", async ({ browser }) => {
  const page = await openCalendar(browser, { viewport: { width: 375, height: 812 } });

  const overflow = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.pageWidth, "the page scrolls sideways").toBeLessThanOrEqual(overflow.screenWidth);

  // Nothing sticks out past the edge, and every day is still on screen.
  const strayEdges = await page.$$eval(".day", (cells) =>
    cells.map((cell) => cell.getBoundingClientRect().right).filter((right) => right > 375.5)
  );
  expect(strayEdges, "day cells reach past the edge of the screen").toEqual([]);

  // Still a calendar: seven columns, not a wrapped list.
  const columns = await page.$eval(".calendar__grid", (grid) =>
    getComputedStyle(grid).gridTemplateColumns.split(" ").length
  );
  expect(columns).toBe(7);

  // Every day is still big enough to be worth reading and, later, tapping.
  const smallest = await page.$$eval(".day", (cells) =>
    Math.min(...cells.map((cell) => cell.getBoundingClientRect().height))
  );
  expect(smallest).toBeGreaterThanOrEqual(44);

  await page.close();
});
