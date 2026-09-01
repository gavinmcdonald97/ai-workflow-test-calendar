// 💾 Events That Stick Around — proves the four acceptance criteria on
// cards/05-events-that-stick-around.md.
//
// Events are added through the real panel and then the page is genuinely
// reloaded. Storage is never pre-seeded through `addInitScript`, because that
// re-runs on every navigation — including a reload — and would overwrite what
// the app had just saved, making "it survived a refresh" pass for the wrong
// reason.

import { test, expect } from "@playwright/test";

const TODAY = new Date(2026, 8, 15, 10, 0, 0); // Tuesday 15 September 2026
const STORAGE_KEY = "calendar.events.v1";

async function openCalendar(browser) {
  const page = await browser.newPage({ locale: "en-GB" });
  await page.clock.install({ time: TODAY });
  await page.goto("/index.html");
  return page;
}

/** Reloads, keeping the pinned clock, the way closing and reopening would. */
async function reload(page) {
  await page.goto("/index.html");
  await page.waitForSelector(".day");
}

const eventsShownOn = (page, date) =>
  page.$$eval(`.day[data-date="${date}"] .event`, (chips) =>
    chips.map((chip) =>
      [chip.querySelector(".event__time").textContent,
       chip.querySelector(".event__title").textContent].join(" ")
    )
  );

async function addEvent(page, { date, title, time }) {
  await page.locator(`.day[data-date="${date}"]`).click();
  await page.locator("#event-title").fill(title);
  await page.locator("#event-time").fill(time);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#event-panel")).toBeHidden();
}

// ---------------------------------------------------------------------------
// Criterion 1 — after adding events and reloading, they are all still there, on
// the right days, with the right titles and times.
// ---------------------------------------------------------------------------

test("Criterion 1: events survive a reload", async ({ browser }) => {
  const page = await openCalendar(browser);

  await addEvent(page, { date: "2026-09-17", title: "Dentist", time: "14:30" });
  await addEvent(page, { date: "2026-09-17", title: "Standup", time: "09:15" });
  await addEvent(page, { date: "2026-09-05", title: "Cinema", time: "19:45" });

  await reload(page);

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:15 Standup", "14:30 Dentist"]);
  expect(await eventsShownOn(page, "2026-09-05")).toEqual(["19:45 Cinema"]);
  expect(await page.locator(".event").count()).toBe(3);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 2 — events added in a different month are still there when
// navigating back to that month.
// ---------------------------------------------------------------------------

test("Criterion 2: events in another month are still there when you go back", async ({ browser }) => {
  const page = await openCalendar(browser);
  const forward = page.getByRole("button", { name: "Next month" });

  await forward.click();
  await forward.click();
  await expect(page.locator("#month-title")).toHaveText("November 2026");
  await addEvent(page, { date: "2026-11-03", title: "Bonfire", time: "18:00" });

  await reload(page);

  // Opens on September again, so November's event is genuinely being read back
  // rather than left over on screen.
  await expect(page.locator("#month-title")).toHaveText("September 2026");
  expect(await page.locator(".event").count()).toBe(0);

  await forward.click();
  await forward.click();
  await expect(page.locator("#month-title")).toHaveText("November 2026");
  expect(await eventsShownOn(page, "2026-11-03")).toEqual(["18:00 Bonfire"]);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 3 — deleting an event and reloading doesn't bring it back.
//
// There is no delete button yet — 🗑️ Changing Your Mind adds it. What belongs
// to this card is that saving writes the whole list rather than appending to
// it, so an event taken out of the list really is gone after a reload. That is
// what is proved here, through the app's own save path. The end-to-end version
// — press Delete, reload, still gone — is proved in 🗑️ Changing Your Mind.
// ---------------------------------------------------------------------------

test("Criterion 3: an event removed from the list does not come back", async ({ browser }) => {
  const page = await openCalendar(browser);

  await addEvent(page, { date: "2026-09-17", title: "Keep me", time: "09:00" });
  await addEvent(page, { date: "2026-09-17", title: "Remove me", time: "11:00" });

  // Remove it and save, exactly as a delete button would.
  await page.evaluate(() => {
    events = events.filter((event) => event.title !== "Remove me");
    saveEvents();
  });

  await reload(page);

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:00 Keep me"]);
  expect(await page.locator(".event").count(), "the removed event came back").toBe(1);

  await page.close();
});

// ---------------------------------------------------------------------------
// Criterion 4 — if the saved data is corrupted or unreadable, the app still
// opens with an empty calendar rather than a blank, broken screen.
// ---------------------------------------------------------------------------

const CORRUPTED = {
  "not JSON at all": "this is not json {{{",
  "JSON, but not a list": '{"events":"lots"}',
  "a list of rubbish": '[1, null, "x", {"nope": true}]',
  "events missing their fields": '[{"id":"a","title":"No date"}]',
  "a date that isn't a date": '[{"id":"a","title":"X","date":"not-a-date","time":"09:00"}]',
  "an empty string": "",
};

for (const [description, corrupted] of Object.entries(CORRUPTED)) {
  test(`Criterion 4: the calendar still opens when the saved data is ${description}`, async ({ browser }) => {
    const page = await openCalendar(browser);

    // Anything the page threw on load would mean a broken screen.
    const crashes = [];
    page.on("pageerror", (error) => crashes.push(error.message));

    await page.evaluate(([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, corrupted]);
    await reload(page);

    expect(crashes, "the page threw while opening").toEqual([]);

    // A whole, working calendar — not a blank screen.
    await expect(page.locator("#month-title")).toHaveText("September 2026");
    expect(await page.locator(".day").count()).toBeGreaterThan(27);
    expect(await page.locator(".day--today").count()).toBe(1);
    expect(await page.locator(".event").count(), "rubbish was shown as events").toBe(0);

    // Nothing was kept, not merely nothing drawn. Without this, a malformed
    // entry passes the check above for the wrong reason: it has no usable date,
    // so it never lands on a day and never draws a chip even when it was
    // loaded. What is being checked is that it was rejected on the way in.
    expect(await page.evaluate(() => events.length), "rubbish was loaded").toBe(0);

    // And it still works: a new event can be added on top of the mess.
    await addEvent(page, { date: "2026-09-17", title: "Still works", time: "10:00" });
    expect(await eventsShownOn(page, "2026-09-17")).toEqual(["10:00 Still works"]);

    await page.close();
  });
}

test("Criterion 4: one bad entry loses that entry, not the whole calendar", async ({ browser }) => {
  const page = await openCalendar(browser);

  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
    STORAGE_KEY,
    JSON.stringify([
      { id: "a", title: "Keep me", date: "2026-09-17", time: "09:00" },
      { id: "b", title: "Broken" },
    ]),
  ]);
  await reload(page);

  expect(await eventsShownOn(page, "2026-09-17")).toEqual(["09:00 Keep me"]);
  expect(await page.locator(".event").count()).toBe(1);
  // The broken entry was rejected on the way in, not merely left undrawn.
  expect(await page.evaluate(() => events.length), "the broken entry was kept").toBe(1);

  await page.close();
});
