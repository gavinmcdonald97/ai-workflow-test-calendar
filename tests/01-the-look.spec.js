// 🎨 The Look — proves the four acceptance criteria on cards/01-the-look.md.

import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { composite, contrastRatio } from "./contrast.js";

/** Reads a design token's value as the browser actually resolves it. */
async function token(page, name) {
  return page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name
  );
}

// ---------------------------------------------------------------------------
// Criterion 1 — the reference page shows the palette, the typefaces at their
// real sizes, and the standard components as they will actually appear.
// ---------------------------------------------------------------------------

test.describe("Criterion 1: the reference page shows the design", () => {
  test("shows a labelled swatch for every colour in the palette", async ({ page }) => {
    await page.goto("/design.html");

    const names = await page.locator(".swatch__name").allInnerTexts();
    expect(names).toEqual(
      expect.arrayContaining([
        "--backdrop-base",
        "--backdrop-wash-1",
        "--backdrop-wash-2",
        "--backdrop-wash-3",
        "--color-ink",
        "--color-ink-muted",
        "--color-accent",
        "--color-danger",
      ])
    );
    // Every swatch is actually painted, not an empty box.
    for (const chip of await page.locator(".swatch__chip").all()) {
      await expect(chip).toBeVisible();
    }
  });

  test("shows each type size rendered at that exact size", async ({ page }) => {
    await page.goto("/design.html");

    const expected = {
      "--text-2xl": "40px",
      "--text-xl": "28px",
      "--text-lg": "20px",
      "--text-base": "16px",
      "--text-sm": "14px",
      "--text-xs": "12px",
    };

    for (const [name, size] of Object.entries(expected)) {
      // The specimen's size comes from the token, so what it actually renders
      // at is the real check — this is what "at their real sizes" means.
      // (The token itself is declared in rem, and only becomes px on screen.)
      const specimen = page.locator(`.specimen:has-text("${name}") .specimen__text`);
      await expect(specimen).toBeVisible();
      await expect(specimen).toHaveCSS("font-size", size);
    }
  });

  test("shows the standard components", async ({ page }) => {
    await page.goto("/design.html");

    await expect(page.locator(".button--primary").first()).toBeVisible();
    await expect(page.locator(".button--danger").first()).toBeVisible();
    await expect(page.locator(".field__input").first()).toBeVisible();
    await expect(page.locator(".field__error").first()).toBeVisible();
    await expect(page.locator(".panel").first()).toBeVisible();
    // The material itself is on show, over something busy enough to see it
    // frost rather than just look pale.
    await expect(page.locator(".material__chip.glass").first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Criterion 2 — colours, fonts and spacing are defined in one place, by name,
// so a later card refers to the accent colour by name rather than picking a
// colour itself.
// ---------------------------------------------------------------------------

test.describe("Criterion 2: everything is defined once, by name", () => {
  const REQUIRED_TOKENS = [
    "--backdrop-base", "--backdrop-wash-1", "--backdrop-wash-2", "--backdrop-wash-3",
    "--glass-fill", "--glass-fill-strong", "--glass-blur", "--glass-border",
    "--glass-highlight", "--glass-shadow", "--glass-shadow-sm", "--shadow-inset",
    "--color-sunken", "--color-ink", "--color-ink-muted",
    "--color-accent", "--color-accent-contrast", "--color-accent-soft",
    "--color-danger", "--color-danger-contrast",
    "--font-ui",
    "--text-xs", "--text-sm", "--text-base", "--text-lg", "--text-xl", "--text-2xl",
    "--tracking-tight", "--leading-tight", "--leading-normal",
    "--space-1", "--space-2", "--space-3", "--space-4",
    "--space-5", "--space-6", "--space-7", "--space-8",
    "--radius-sm", "--radius-md", "--radius-lg", "--radius-xl",
  ];

  test("every token has a value on the page", async ({ page }) => {
    await page.goto("/design.html");
    for (const name of REQUIRED_TOKENS) {
      expect(await token(page, name), `${name} is not defined`).not.toBe("");
    }
  });

  test("no stylesheet outside tokens.css picks a colour of its own", () => {
    // A raw colour anywhere else is the drift this card exists to prevent.
    // Every stylesheet is checked, including ones added by later cards — that
    // is the point: the rule has to hold as the project grows.
    const colourLiteral = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi;

    const stylesheets = readdirSync("styles")
      .filter((name) => name.endsWith(".css") && name !== "tokens.css");
    expect(stylesheets.length).toBeGreaterThan(0);

    for (const name of stylesheets) {
      const found = readFileSync(`styles/${name}`, "utf8").match(colourLiteral) ?? [];
      expect(found, `styles/${name} chooses its own colours: ${found.join(", ")}`).toEqual([]);
    }
  });

  test("the components use the token names", async ({ page }) => {
    await page.goto("/design.html");

    // The primary button is painted with the accent, not a colour of its own.
    const accent = await token(page, "--color-accent");
    await expect(page.locator(".button--primary").first())
      .toHaveCSS("background-color", `rgb(${(await page.evaluate(
        (c) => { const d = document.createElement("div"); d.style.color = c;
                 document.body.append(d); const v = getComputedStyle(d).color;
                 d.remove(); return v.match(/[\d.]+/g).slice(0, 3).join(", "); },
        accent
      ))})`);
  });
});

// ---------------------------------------------------------------------------
// Criterion 3 — switching the computer to dark mode changes the page to a dark
// version that is still readable.
// ---------------------------------------------------------------------------

test.describe("Criterion 3: dark mode", () => {
  test("the page turns dark and the text turns light", async ({ browser }) => {
    const light = await browser.newPage({ colorScheme: "light" });
    await light.goto("/design.html");
    const lightBackdrop = await token(light, "--backdrop-base");
    const lightInk = await token(light, "--color-ink");

    const dark = await browser.newPage({ colorScheme: "dark" });
    await dark.goto("/design.html");
    const darkBackdrop = await token(dark, "--backdrop-base");
    const darkInk = await token(dark, "--color-ink");

    expect(darkBackdrop).not.toBe(lightBackdrop);
    expect(darkInk).not.toBe(lightInk);

    // Dark really is dark, and the ink really is light — not just different.
    const white = "#FFFFFF";
    expect(contrastRatio(darkBackdrop, white)).toBeGreaterThan(
      contrastRatio(lightBackdrop, white)
    );
    expect(contrastRatio(darkInk, darkBackdrop)).toBeGreaterThan(4.5);

    await light.close();
    await dark.close();
  });
});

// ---------------------------------------------------------------------------
// Criterion 4 — text on its background is legible enough to pass the standard
// accessibility contrast check.
//
// Glass makes this a real question: what sits behind the text changes as the
// colour wash drifts underneath. So each text colour is measured against the
// worst case — the glass fill composited over the most saturated point of every
// wash — rather than against one convenient background.
// ---------------------------------------------------------------------------

const MINIMUM_CONTRAST = 4.5;

for (const scheme of ["light", "dark"]) {
  test(`Criterion 4: every text colour is legible in ${scheme} mode`, async ({ browser }) => {
    const page = await browser.newPage({ colorScheme: scheme });
    await page.goto("/design.html");

    const backdrops = await Promise.all(
      ["--backdrop-base", "--backdrop-wash-1", "--backdrop-wash-2", "--backdrop-wash-3"]
        .map((name) => token(page, name))
    );
    const glassFill = await token(page, "--glass-fill");

    // Every background a piece of text can end up sitting on.
    const possibleBackgrounds = backdrops.map((wash) => composite(glassFill, wash));

    for (const name of ["--color-ink", "--color-ink-muted", "--color-accent", "--color-danger"]) {
      const colour = await token(page, name);
      const worst = Math.min(
        ...possibleBackgrounds.map((background) => contrastRatio(colour, background))
      );
      expect(worst, `${name} over glass, worst case`).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
    }

    // Text placed on top of a solid accent or danger fill.
    for (const [text, fill] of [
      ["--color-accent-contrast", "--color-accent"],
      ["--color-danger-contrast", "--color-danger"],
    ]) {
      const ratio = contrastRatio(await token(page, text), await token(page, fill));
      expect(ratio, `${text} on ${fill}`).toBeGreaterThanOrEqual(MINIMUM_CONTRAST);
    }

    await page.close();
  });
}
