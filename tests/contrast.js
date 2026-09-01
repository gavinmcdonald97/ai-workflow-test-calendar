// The contrast maths, kept out of the tests so the tests stay readable.
// This is the standard WCAG calculation — nothing project-specific.

/** "#RRGGBB", "rgb(1 2 3)" or "rgb(1, 2, 3)" -> [r, g, b] out of 255. */
export function toRgb(colour) {
  const hex = colour.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const numbers = colour.match(/[\d.]+/g);
  if (!numbers || numbers.length < 3) throw new Error(`Cannot read colour: ${colour}`);
  return numbers.slice(0, 3).map(Number);
}

/** The alpha of "rgb(1 2 3 / 40%)" or "rgba(1, 2, 3, 0.4)" — 1 if it has none. */
export function toAlpha(colour) {
  const percent = colour.match(/\/\s*([\d.]+)%/);
  if (percent) return Number(percent[1]) / 100;
  const numbers = colour.match(/[\d.]+/g) ?? [];
  return numbers.length >= 4 ? Number(numbers[3]) : 1;
}

/** What you actually see when a translucent colour sits on top of a solid one. */
export function composite(top, bottom) {
  const alpha = toAlpha(top);
  const [tr, tg, tb] = toRgb(top);
  const [br, bg, bb] = toRgb(bottom);
  return [
    Math.round(alpha * tr + (1 - alpha) * br),
    Math.round(alpha * tg + (1 - alpha) * bg),
    Math.round(alpha * tb + (1 - alpha) * bb),
  ];
}

function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 1 (invisible) to 21 (black on white). Normal text needs at least 4.5. */
export function contrastRatio(foreground, background) {
  const a = relativeLuminance(Array.isArray(foreground) ? foreground : toRgb(foreground));
  const b = relativeLuminance(Array.isArray(background) ? background : toRgb(background));
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}
