// 🗓️ The Month Grid — works out which days belong on one page of the calendar,
// and draws them.
//
// Deliberately a plain script rather than a module, so index.html can be opened
// by double-clicking the file as well as through a server.

// ---------------------------------------------------------------------------
// Working out the days
// ---------------------------------------------------------------------------

/**
 * The days shown on one page of the calendar: every day of the month, plus
 * enough days either side to fill whole Monday-to-Sunday weeks.
 *
 * `month` is 0-11, the way JavaScript's own Date counts them.
 * Returns [{ date, inMonth }] in the order they are read, left to right.
 *
 * This is kept separate from the drawing below so the date arithmetic — which
 * is where calendars usually go wrong — can be checked on its own.
 */
function monthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);

  // Weeks start on Monday. getDay() calls Sunday 0, so shift it round.
  const weekdayOfFirst = (firstOfMonth.getDay() + 6) % 7;

  // Day 0 of the next month is the last day of this one.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Only as many whole weeks as it takes to cover the month — so a short month
  // doesn't get a trailing week belonging entirely to the next one.
  const weeks = Math.ceil((weekdayOfFirst + daysInMonth) / 7);

  const days = [];
  for (let offset = 0; offset < weeks * 7; offset++) {
    // Asking for "1 - weekdayOfFirst" or "35" of a month is allowed: Date rolls
    // over into the neighbouring month, and the year, on its own.
    const date = new Date(year, month, 1 - weekdayOfFirst + offset);
    days.push({ date, inMonth: date.getMonth() === month });
  }
  return days;
}

/** True when two dates are the same calendar day, ignoring the time. */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------------------------------------------------------------------------
// Drawing them
// ---------------------------------------------------------------------------

/** Monday-first weekday names, in whatever language the computer is set to. */
function weekdayNames() {
  // 5 January 1970 was a Monday — any known Monday will do.
  const names = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(1970, 0, 5 + day);
    names.push(date.toLocaleDateString(undefined, { weekday: "short" }));
  }
  return names;
}

/**
 * Draws one month into the page.
 *
 * `today` is passed in rather than read from the clock inside here, so a test
 * can say what "today" is without having to move the computer's clock.
 */
function renderMonth(year, month, today = new Date()) {
  const title = document.querySelector("#month-title");
  const weekdays = document.querySelector("#weekdays");
  const grid = document.querySelector("#calendar-grid");

  title.textContent = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  weekdays.replaceChildren(
    ...weekdayNames().map((name) => {
      const cell = document.createElement("div");
      cell.className = "weekday";
      cell.textContent = name;
      return cell;
    })
  );

  grid.replaceChildren(
    ...monthGrid(year, month).map(({ date, inMonth }) => {
      const day = document.createElement("div");
      day.className = "day";
      if (!inMonth) day.classList.add("day--outside");
      if (isSameDay(date, today)) day.classList.add("day--today");

      // The full date, for anyone using a screen reader and for the tests.
      day.dataset.date = toDateKey(date);

      const number = document.createElement("span");
      number.className = "day__number";
      number.textContent = date.getDate();
      day.append(number);
      return day;
    })
  );
}

/** A date as "2026-09-15" — sortable, and the same string every time. */
function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  renderMonth(today.getFullYear(), today.getMonth(), today);
});
