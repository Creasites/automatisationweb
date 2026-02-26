import { QrCodeInput, QrCodeResult } from "./types";

const MIN_SIZE = 128;
const MAX_SIZE = 1024;

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeSize(size?: number): number {
  const defaultSize = 320;
  if (typeof size !== "number" || Number.isNaN(size)) {
    return defaultSize;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(size)));
}

function normalizeMargin(margin?: number): number {
  const defaultMargin = 2;
  if (typeof margin !== "number" || Number.isNaN(margin)) {
    return defaultMargin;
  }
  return Math.min(8, Math.max(0, Math.round(margin)));
}

export async function generateQrCode(input: QrCodeInput): Promise<QrCodeResult> {
  const text = normalizeText(input.text);
  if (text.length < 1) {
    throw new Error("TEXT_EMPTY");
  }

  const size = normalizeSize(input.size);
  const margin = normalizeMargin(input.margin);
  const darkColor = (input.darkColor || "#000000").replace("#", "");
  const lightColor = (input.lightColor || "#FFFFFF").replace("#", "");
  const encodedText = encodeURIComponent(text);
  const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=${margin}&color=${darkColor}&bgcolor=${lightColor}&data=${encodedText}`;

  return {
    text,
    size,
    margin,
    format: "png",
    imageUrl,
  };
}