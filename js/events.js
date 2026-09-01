// ✍️ Adding an Event — the events themselves, and the panel you add them in.
//
// Loaded before calendar.js, because the grid asks this file what is on each
// day while it draws.

// ---------------------------------------------------------------------------
// 💾 Events That Stick Around
//
// Kept in this browser, on this machine, under one key. No account, no server,
// no syncing between devices.
// ---------------------------------------------------------------------------

// Versioned, so that if the shape of an event ever changes, old data can be
// recognised rather than silently misread.
const STORAGE_KEY = "calendar.events.v1";

/**
 * Everything saved last time, or an empty calendar.
 *
 * Anything unreadable gives an empty calendar rather than a broken page: the
 * stored text can be absent, not be JSON at all, or be JSON of the wrong shape,
 * and none of those should stop the calendar opening.
 */
function loadEvents() {
  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked entirely — private browsing, or site data turned
    // off. The calendar still works, it just won't remember anything.
    return [];
  }

  if (stored === null) return [];

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  // One bad entry loses that entry, not the whole calendar.
  return parsed.filter(isEvent);
}

/** Whether something read back from storage is really an event. */
function isEvent(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    typeof value.time === "string" &&
    /^\d{2}:\d{2}$/.test(value.time)
  );
}

/** Writes the whole list back, so removals are saved as well as additions. */
function saveEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage can be full or blocked. Losing the save is better than losing
    // the page.
  }
}

// Every event. Loaded from the browser's storage when the page opens, and
// written back after every change.
let events = loadEvents();

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

// The event the panel is changing, or null when it is adding a new one. This is
// the only difference between the two modes.
let panelEventId = null;

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
    heading: document.querySelector("#event-panel-title"),
    day: document.querySelector("#event-panel-day"),
    title: document.querySelector("#event-title"),
    time: document.querySelector("#event-time"),
    error: document.querySelector("#event-title-error"),
    actions: document.querySelector("#event-actions"),
    deleteButton: document.querySelector("#event-delete"),
    confirm: document.querySelector("#event-delete-confirm"),
  };
}

/**
 * Opens the panel — to add an event to a day, or, given an event's id, to change
 * that event.
 */
function openEventPanel(date, eventId = null) {
  const parts = panelParts();
  const { panel, form, heading, day, title, time, error } = parts;

  panelDate = date;
  panelEventId = eventId;
  day.textContent = formatDayLong(date);
  form.reset();
  showTitleError(error, title, null);
  showDeleteConfirmation(parts, false);

  const existing = events.find((event) => event.id === eventId);
  if (existing) {
    heading.textContent = "Edit event";
    title.value = existing.title;
    time.value = existing.time;
  } else {
    heading.textContent = "New event";
    time.value = "09:00";
  }
  // There is only something to delete once the event exists.
  parts.deleteButton.hidden = !existing;

  panel.showModal();
  title.focus();
  title.select();
}

/** Swaps the normal buttons for "Delete this event?", or back again. */
function showDeleteConfirmation({ actions, confirm }, asking) {
  actions.hidden = asking;
  confirm.hidden = !asking;
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
    // An event is checked for first: pressing one opens that event rather than
    // starting a new one on the day it sits in.
    const chip = clicked.target.closest(".event");
    if (chip) {
      const existing = events.find((event) => event.id === chip.dataset.eventId);
      if (existing) openEventPanel(existing.date, existing.id);
      return;
    }

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

    // A time input can be left empty; treat that as the start of the day so the
    // event still sorts sensibly against the others.
    const whenValue = time.value || "00:00";

    const existing = events.find((event) => event.id === panelEventId);
    if (existing) {
      // Changed in place, so no second copy is left behind. The day is not
      // touched — moving an event to another day is parked for later.
      existing.title = name;
      existing.time = whenValue;
    } else {
      events.push({ id: newEventId(), date: panelDate, time: whenValue, title: name });
    }

    saveEvents();
    panel.close();
    showMonth(shownYear, shownMonth); // Redraw, so the new event appears.
  });

  // Deleting takes two presses. The first only asks.
  const parts = panelParts();
  parts.deleteButton.addEventListener("click", () => showDeleteConfirmation(parts, true));
  document.querySelector("#event-delete-keep")
    .addEventListener("click", () => showDeleteConfirmation(parts, false));

  document.querySelector("#event-delete-really").addEventListener("click", () => {
    events = events.filter((event) => event.id !== panelEventId);
    saveEvents();
    panel.close();
    showMonth(shownYear, shownMonth);
  });

  // Cancel, Escape and clicking away all just close the panel. Nothing is
  // created, changed or deleted, because each of those only ever happens on the
  // button that says so.
  document.querySelector("#event-cancel").addEventListener("click", () => panel.close());
});
