# 🎨 The Look

**Status:** building
**Branch / PR:** <filled by trellis>

## What it is
The visual foundation the whole calendar is built on: the colours, the
typefaces, the spacing, and what the standard pieces — a button, a text box, a
panel — actually look like. Built once, up front, as a page you can look at.

## Why it exists
The point of this project is a calendar that's genuinely lovely to look at. If
each piece of the app picks its own colours and sizes as it goes, the result
drifts and ends up looking assembled rather than designed. Deciding the visual
language first, in one place, means every later card just uses it — and the
whole thing stays consistent without anyone having to police it.

## How it connects
Nothing depends on it existing to *function*, but every other card depends on it
to *look right*. 🗓️ The Month Grid, ✍️ Adding an Event and 🗑️ Changing Your Mind
all draw their colours, type and components from here rather than inventing
their own.

## Simplest version (now)
A single reference page showing the palette, the type scale and the core
components, backed by named design tokens in CSS. Light and dark. No calendar
on it yet.

## Design direction
Quiet editorial. A warm off-white paper background rather than clinical white.
A serif face for the month name and day numbers so the calendar has character
instead of looking like an admin grid; a clean sans for everything else. One
accent colour, used sparingly — today's date, the save button, an event's colour
bar. Generous space. Soft, low shadows.

## Acceptance criteria
1. There is a page I can open that shows the palette, the typefaces at their real
   sizes, and the standard components (button, text box, panel) as they will
   actually appear in the app.
   - **Verify:** <harvest>
2. Colours, fonts and spacing are defined in one place, by name, so a later card
   refers to the accent colour by name rather than picking a colour itself.
   - **Verify:** <harvest>
3. Switching the operating system to dark mode changes the page to a dark
   version that is still readable.
   - **Verify:** <harvest>
4. Text on its background is legible enough to pass the standard accessibility
   contrast check.
   - **Verify:** <harvest>

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- `styles/tokens.css` — every colour, font, size, space, radius and shadow, by
  name. The dark palette redefines only the colours; type, space and shape are
  the same in both.
- `styles/base.css` — the reset, plain element defaults, one shared focus ring.
- `styles/components.css` — `.button` (default, primary, danger, icon),
  `.field` (label, input, error) and `.panel`. Later cards use these classes
  rather than styling buttons and inputs of their own.
- `design.html` — the reference page: palette, type at real sizes, the spacing
  scale to scale, the components as they will actually appear, and a table of
  the measured contrast ratios.
- `styles/design-page.css` — layout for the reference page only. It arranges
  swatches and specimens and invents no colours or type; the calendar itself
  never loads it.

Two colours carry the text: `--color-ink` and `--color-ink-muted`. A third,
fainter one was tried for the neighbouring-month days and dropped — anything
faint enough to look different failed the contrast check, and anything that
passed was too close to `--color-ink-muted` to be worth a name. Those days will
be set apart by their sunken background instead.

## Could come later
A manual light/dark toggle that overrides the system setting. More than one
accent colour. Motion and transition guidelines. Icon set.
