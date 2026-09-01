**The visual foundation every later card is built from: one glass material, one set of named tokens, and a reference page you can look at.**

## What it is

The colours, the typefaces, the spacing, and what the standard pieces — a button, a text box, a panel — actually look like. Built once, up front, as a page you can open.

## Why it exists

The point of this project is a calendar that's genuinely lovely to look at. If each piece of the app picks its own colours and sizes as it goes, the result drifts and ends up looking assembled rather than designed. Deciding the visual language first, in one place, means every later card just uses it — and the whole thing stays consistent without anyone having to police it.

## How it connects

Nothing depends on it to *function*, but every other card depends on it to *look right*. 🗓️ The Month Grid, ✍️ Adding an Event and 🗑️ Changing Your Mind all draw their colours, type and components from here rather than inventing their own.

This is the bottom of the stack — it targets the project trunk `feature/calendar` directly.

## The design

Liquid glass, in the manner of recent Apple interfaces. A soft wash of colour sits fixed behind the page — cool blue, soft lilac, warm peach — and everything raised above it is made of the same translucent material: a frosted fill that blurs what's behind it, a bright hairline edge, and a single lit line along the top where light catches. Generously rounded corners. The system's own typeface, set tight at large sizes. One accent, used sparingly. Dark mode swaps the wash for deep blue, violet and teal, and turns the frost into a lit film.

The material lives in **one class, `.glass`**, shared by the calendar card, the buttons and the event panel — without it, several rules would repeat the same five properties and drift apart the moment one changed.

## Scope

Simplest version only: a reference page showing the palette, the type scale and the core components, backed by named tokens in CSS, in light and dark. No calendar on it yet.

Deliberately parked: a manual light/dark toggle overriding the system setting, more than one accent colour, motion and transition guidelines, an icon set.

## Acceptance criteria

- [x] **There is a page I can open that shows the palette, the typefaces at their real sizes, and the standard components as they will actually appear.**
  — `test:` [`tests/01-the-look.spec.js` :: Criterion 1](tests/01-the-look.spec.js) (3 tests) · red→green ✅
  **Red:** removed the type specimens and the panel from `design.html` — 2 failed. **Green:** restored — 3 passed.

- [x] **Colours, fonts and spacing are defined in one place, by name, so a later card refers to the accent colour by name rather than picking a colour itself.**
  — `test:` [`tests/01-the-look.spec.js` :: Criterion 2](tests/01-the-look.spec.js) (3 tests) · red→green ✅
  Every token resolves; no stylesheet outside `tokens.css` contains a colour literal; the primary button really is painted with `--color-accent`.
  **Red:** put a hard-coded colour back into `components.css` and deleted a token — 2 failed. **Green:** restored — 3 passed.
  ⚠️ This check found a real violation while being written: the input's inset shadow carried a hard-coded colour. It is now `--shadow-inset`.

- [x] **Switching the operating system to dark mode changes the page to a dark version that is still readable.**
  — `test:` [`tests/01-the-look.spec.js` :: Criterion 3](tests/01-the-look.spec.js) · red→green ✅
  Loads the page under both `colorScheme` settings and asserts the backdrop really darkens, the ink really lightens, and the two still clear 4.5.
  **Red:** deleted the `prefers-color-scheme: dark` block — failed. **Green:** restored — passed.

- [x] **Text on its background is legible enough to pass the standard accessibility contrast check.**
  — `test:` [`tests/01-the-look.spec.js` :: Criterion 4](tests/01-the-look.spec.js) (light and dark) · red→green ✅
  Glass makes this a real question, because what sits behind the text changes as the wash drifts underneath. The test reads the real token values off the live page, composites the glass fill over **every** backdrop wash, and requires the **worst** resulting ratio to clear 4.5. Measured worst case: **4.9 light, 5.1 dark**.
  **Red:** set `--color-ink-muted` to a pale grey — light mode failed at 1.9, dark still passed. **Green:** restored — both passed.

All 9 tests pass. Run them with `npm test`.

## Screenshots

Light:

![light](plans/prs/assets/01-the-look/light.png)

Dark:

![dark](plans/prs/assets/01-the-look/dark.png)

## Notes for the reviewer

- **Test tooling for the whole project is set up here** — Playwright driving a plain `python3 -m http.server`, one command (`npm test`). Cards 2–6 all have criteria that need a real browser (clicking days, dialogs, surviving a reload), so it earns its place across the project rather than just this card.
- **No web font.** The typeface is the system's own — SF on Apple, Segoe on Windows — so there is nothing to download and nothing to go wrong offline.
- **Glass depends on `backdrop-filter`.** Where it is missing, `@supports` falls the material back to a solid surface rather than a muddy translucent one; the layout still works.
- `styles/design-page.css` is layout for the reference page only. It invents no colours or type, and the calendar itself never loads it.

## Links

- Card: [`cards/01-the-look.md`](cards/01-the-look.md)
- Plan step 1: [`plans/calendar-plan.md`](plans/calendar-plan.md)

## Stack

On `feature/calendar`, merged bottom-up into it:

1. **🎨 The Look ← you are here**
2. #2 — 🗓️ The Month Grid
3. ⏭️ Moving Between Months — not built yet
4. ✍️ Adding an Event — not built yet
5. 💾 Events That Stick Around — not built yet
6. 🗑️ Changing Your Mind — not built yet

Then one feature PR `feature/calendar` → `main` for the maintainer to review and merge.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
