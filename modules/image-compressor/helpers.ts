import { ImageCompressorInput, ImageCompressorResult } from "./types";

export function clampQuality(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.8;
  }
  return Math.min(1, Math.max(0.1, value));
}

export function clampWidth(value: number): number {
  if (!Number.isFinite(value)) {
    return 1600;
  }
  return Math.min(4000, Math.max(200, Math.round(value)));
}

export function normalizeCompressorInput(input: ImageCompressorInput): ImageCompressorInput {
  return {
    quality: clampQuality(input.quality),
    maxWidth: clampWidth(input.maxWidth),
    format: input.format,
  };
}

export function buildCompressionResult(
  originalSizeBytes: number,
  compressedSizeBytes: number,
  outputFormat: ImageCompressorInput["format"],
): ImageCompressorResult {
  const reductionRaw = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100;
  const reductionPercent = Number(Math.max(0, reductionRaw).toFixed(2));

  return {
    originalSizeBytes,
    compressedSizeBytes,
    reductionPercent,
    outputFormat,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}