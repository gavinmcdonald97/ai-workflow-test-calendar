// ✍️ Adding an Event — the events themselves, and the panel you add them in.
//
// Loaded before calendar.js, because the grid asks this file what is on each
// day while it draws.

// Every event, in memory. 💾 Events That Stick Around will make this survive a
// reload; for now it lasts as long as the page is open.
let events = [];

/** The events on one day ("2026-09-15"), earliest first. */
function eventsOn(date) {
  return events
    .filter((event) => event.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

/** A unique id for a new event. Not a UUID — it only has to be unique here. */
function newEventId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "2026-09-15" as "Tuesday 15 September". */
function formatDayLong(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

// The day the panel is adding to. Set every time the panel is opened, and only
// read while it is open.
//
// It is deliberately NOT cleared when the panel closes: a dialog's `close`
// event fires asynchronously, so clearing it there would land *after* the panel
// had been reopened for another day, and the next event would be saved with no
// date at all.
let panelDate = null;

function panelParts() {
  return {
    panel: document.querySelector("#event-panel"),
    form: document.querySelector("#event-form"),
    day: document.querySelector("#event-panel-day"),
    title: document.querySelector("#event-title"),
    time: document.querySelector("#event-time"),
    error: document.querySelector("#event-title-error"),
  };
}

/** Opens the panel to add an event to one day. */
function openEventPanel(date) {
  const { panel, form, day, title, time, error } = panelParts();

  panelDate = date;
  day.textContent = formatDayLong(date);
  form.reset();
  time.value = "09:00";
  showTitleError(error, title, null);

  panel.showModal();
  title.focus();
}

/** Shows the reason a title was refused, or clears it when given null. */
function showTitleError(error, title, message) {
  error.textContent = message ?? "";
  error.hidden = message === null;
  // Marked as invalid as well as coloured, so it doesn't rely on colour alone.
  title.setAttribute("aria-invalid", message === null ? "false" : "true");
}

// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const { panel, form, title, time, error } = panelParts();

  // One listener for the whole grid rather than one per day, so it keeps
  // working as the grid is redrawn.
  document.querySelector("#calendar-grid").addEventListener("click", (clicked) => {
    const day = clicked.target.closest(".day");
    if (day) openEventPanel(day.dataset.date);
  });

  form.addEventListener("submit", (submitted) => {
    submitted.preventDefault();

    const name = title.value.trim();
    if (name === "") {
      showTitleError(error, title, "Give the event a name.");
      title.focus();
      return; // Nothing is created, and the panel stays open.
    }

    events.push({
      id: newEventId(),
      date: panelDate,
      // A time input can be left empty; treat that as the start of the day so
      // the event still sorts sensibly against the others.
      time: time.value || "00:00",
      title: name,
    });

    panel.close();
    showMonth(shownYear, shownMonth); // Redraw, so the new event appears.
  });

  // Cancel, Escape and clicking away all just close the panel. Nothing is
  // created, because creating only ever happens on submit above.
  document.querySelector("#event-cancel").addEventListener("click", () => panel.close());
});
