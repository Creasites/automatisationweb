export type ImageOutputFormat = "image/jpeg" | "image/webp";

export interface ImageCompressorInput {
  quality: number;
  maxWidth: number;
  format: ImageOutputFormat;
}

export interface ImageCompressorResult {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercent: number;
  outputFormat: ImageOutputFormat;
}