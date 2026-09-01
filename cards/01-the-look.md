# 🎨 The Look

**Status:** in-review
**Branch / PR:** `calendar/01-the-look` · [PR #1](https://github.com/gavinmcdonald97/ai-workflow-test-calendar/pull/1) → `feature/calendar`

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
Liquid glass, in the manner of recent Apple interfaces. A soft wash of colour
sits fixed behind the page — cool blue, soft lilac, warm peach — and everything
raised above it is made of the same translucent material: a frosted fill that
blurs whatever is behind it, a bright hairline edge, and a single lit line along
the top where light catches. Generously rounded corners. The system's own
typeface, set tight at large sizes. One accent, used sparingly. Dark mode swaps
the wash for deep blue, violet and teal, and turns the frost into a lit film.

## Acceptance criteria
1. There is a page I can open that shows the palette, the typefaces at their real
   sizes, and the standard components (button, text box, panel) as they will
   actually appear in the app. ✅
   - **Verify:** `test: tests/01-the-look.spec.js::Criterion 1` (3 tests)
   - **Red:** removed the type specimens and the panel from `design.html` —
     2 failed. **Green:** restored — 3 passed.
2. Colours, fonts and spacing are defined in one place, by name, so a later card
   refers to the accent colour by name rather than picking a colour itself. ✅
   - **Verify:** `test: tests/01-the-look.spec.js::Criterion 2` (3 tests) — every
     token resolves, no stylesheet outside `tokens.css` contains a colour
     literal, and the primary button really is painted with `--color-accent`.
   - **Red:** put a hard-coded colour back into `components.css` and deleted a
     token — 2 failed. **Green:** restored — 3 passed.
   - This check found a real violation while being written: the input's inset
     shadow had a hard-coded colour. It is now `--shadow-inset`.
3. Switching the operating system to dark mode changes the page to a dark
   version that is still readable. ✅
   - **Verify:** `test: tests/01-the-look.spec.js::Criterion 3` — loads the page
     under both `colorScheme` settings and asserts the backdrop really darkens,
     the ink really lightens, and the two still clear 4.5.
   - **Red:** deleted the `prefers-color-scheme: dark` block — 1 failed.
     **Green:** restored — 1 passed.
4. Text on its background is legible enough to pass the standard accessibility
   contrast check. ✅
   - **Verify:** `test: tests/01-the-look.spec.js::Criterion 4` (light and dark)
     — reads the real token values off the live page, composites the glass fill
     over every backdrop wash, and requires the **worst** resulting ratio to
     clear 4.5 for each text colour. Measured worst case: 4.9 light, 5.1 dark.
   - **Red:** set `--color-ink-muted` to a pale grey — light mode failed at 1.9,
     dark still passed. **Green:** restored — both passed.

_No criterion may be checked off without its verification passing. See the
`harvest` skill._

## What was built
- `styles/tokens.css` — every colour, material property, font, size, space and
  radius, by name. Dark mode redefines only colour and material; type, space and
  shape are the same in both.
- `styles/base.css` — the reset, the fixed colour wash behind the page, plain
  element defaults, one shared focus ring.
- `styles/components.css` — `.glass` (the material), `.button` (default,
  primary, danger, icon), `.field` (label, input, error) and `.panel`. Later
  cards use these rather than styling buttons and inputs of their own.
- `design.html` — the reference page: the material on show over a busy
  background, the palette, type at real sizes, the spacing and corner scales,
  the components as they will actually appear, and the measured contrast table.
- `styles/design-page.css` — layout for the reference page only. It arranges
  swatches and specimens and invents no colours or type; the calendar itself
  never loads it.

`.glass` exists as its own class because the calendar card, the buttons and the
event panel are all the same material — without it, several rules would repeat
the same five properties and drift apart the moment one changed.

Glass makes contrast a real question, because what sits behind the text varies.
It is answered by keeping the wash within a known range and the fill dense
enough that the effective background stays predictable. Every text colour was
measured against the worst case — the most saturated point of each wash seen
through the glass — in both themes, and the lowest ratio is 4.9. Where a browser
does not support the blur, the glass falls back to a solid surface rather than a
muddy translucent one.

The typeface is the system's own — SF on Apple, Segoe on Windows — so there is
no font to download and nothing to go wrong offline.

## Could come later
A manual light/dark toggle that overrides the system setting. More than one
accent colour. Motion and transition guidelines. Icon set.
