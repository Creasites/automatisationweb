import { FaviconInput, FaviconResult } from "./types";

function normalizeHexColor(value: string): string {
  const cleaned = value.trim().replace("#", "").toUpperCase();

  if (/^[0-9A-F]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  if (/^[0-9A-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }

  throw new Error("INVALID_COLOR");
}

function normalizeLetter(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("LETTER_EMPTY");
  }

  return trimmed.charAt(0).toUpperCase();
}

function buildSvg(letter: string, backgroundColor: string, textColor: string, rounded: boolean): string {
  const rx = rounded ? "18" : "0";

  return [
    "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 64 64\">",
    `<rect x=\"0\" y=\"0\" width=\"64\" height=\"64\" rx=\"${rx}\" fill=\"${backgroundColor}\" />`,
    `<text x=\"32\" y=\"41\" text-anchor=\"middle\" font-size=\"34\" font-family=\"Arial, Helvetica, sans-serif\" font-weight=\"700\" fill=\"${textColor}\">${letter}</text>`,
    "</svg>",
  ].join("");
}

export function generateFavicon(input: FaviconInput): FaviconResult {
  const letter = normalizeLetter(input.letter);
  const backgroundColor = normalizeHexColor(input.backgroundColor);
  const textColor = normalizeHexColor(input.textColor);
  const rounded = Boolean(input.rounded);

  const svg = buildSvg(letter, backgroundColor, textColor, rounded);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const htmlSnippet = `<link rel=\"icon\" type=\"image/svg+xml\" href=\"${dataUrl}\" />`;

  return {
    letter,
    backgroundColor,
    textColor,
    rounded,
    svg,
    dataUrl,
    htmlSnippet,
  };
}