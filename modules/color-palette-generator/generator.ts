import { ColorPaletteInput, ColorPaletteResult, PaletteColor } from "./types";

function normalizeHex(hex: string): string {
  const cleaned = hex.trim().replace("#", "").toUpperCase();

  if (/^[0-9A-F]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  if (/^[0-9A-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }

  throw new Error("INVALID_HEX_COLOR");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mixWith(rgb: { r: number; g: number; b: number }, target: number, ratio: number) {
  return {
    r: rgb.r + (target - rgb.r) * ratio,
    g: rgb.g + (target - rgb.g) * ratio,
    b: rgb.b + (target - rgb.b) * ratio,
  };
}

function toHex(rgb: { r: number; g: number; b: number }): string {
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function buildSoftPalette(base: { r: number; g: number; b: number }): PaletteColor[] {
  return [
    { role: "Primary", hex: rgbToHex(base.r, base.g, base.b) },
    { role: "Secondary", hex: toHex(mixWith(base, 255, 0.35)) },
    { role: "Accent", hex: toHex(mixWith(base, 0, 0.2)) },
    { role: "Background", hex: toHex(mixWith(base, 255, 0.9)) },
    { role: "Text", hex: toHex(mixWith(base, 0, 0.8)) },
  ];
}

function buildVibrantPalette(base: { r: number; g: number; b: number }): PaletteColor[] {
  return [
    { role: "Primary", hex: rgbToHex(base.r, base.g, base.b) },
    { role: "Secondary", hex: rgbToHex(base.g, base.b, base.r) },
    { role: "Accent", hex: rgbToHex(base.b, base.r, base.g) },
    { role: "Background", hex: toHex(mixWith(base, 255, 0.95)) },
    { role: "Text", hex: toHex(mixWith(base, 0, 0.85)) },
  ];
}

function buildContrastPalette(base: { r: number; g: number; b: number }): PaletteColor[] {
  const contrast = {
    r: 255 - base.r,
    g: 255 - base.g,
    b: 255 - base.b,
  };

  return [
    { role: "Primary", hex: rgbToHex(base.r, base.g, base.b) },
    { role: "Secondary", hex: rgbToHex(contrast.r, contrast.g, contrast.b) },
    { role: "Accent", hex: toHex(mixWith(contrast, 255, 0.2)) },
    { role: "Background", hex: toHex(mixWith(base, 255, 0.92)) },
    { role: "Text", hex: toHex(mixWith(contrast, 0, 0.55)) },
  ];
}

export function generateColorPalette(input: ColorPaletteInput): ColorPaletteResult {
  const baseColor = normalizeHex(input.baseColor);
  const baseRgb = hexToRgb(baseColor);

  let palette: PaletteColor[];
  if (input.mode === "soft") {
    palette = buildSoftPalette(baseRgb);
  } else if (input.mode === "vibrant") {
    palette = buildVibrantPalette(baseRgb);
  } else {
    palette = buildContrastPalette(baseRgb);
  }

  return {
    baseColor,
    mode: input.mode,
    palette,
  };
}