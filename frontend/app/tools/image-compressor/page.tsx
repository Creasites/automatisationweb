"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  buildCompressionResult,
  formatBytes,
  normalizeCompressorInput,
} from "@modules/image-compressor/helpers";
import { ImageCompressorInput, ImageCompressorResult, ImageOutputFormat } from "@modules/image-compressor/types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("FILE_READ_ERROR"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_ERROR"));
    image.src = dataUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageOutputFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("BLOB_ERROR"));
          return;
        }
        resolve(blob);
      },
      format,
      quality,
    );
  });
}

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [qualityPercent, setQualityPercent] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [format, setFormat] = useState<ImageOutputFormat>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ImageCompressorResult | null>(null);

  const outputName = useMemo(() => {
    if (!file) {
      return "image-compressee.jpg";
    }
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const extension = format === "image/webp" ? "webp" : "jpg";
    return `${baseName}-compressed.${extension}`;
  }, [file, format]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    setResult(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }

  async function onCompress() {
    if (!file) {
      setError("Choisis une image avant de lancer la compression.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: ImageCompressorInput = normalizeCompressorInput({
        quality: qualityPercent / 100,
        maxWidth,
        format,
      });

      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(dataUrl);

      const scale = image.width > input.maxWidth ? input.maxWidth / image.width : 1;
      const targetWidth = Math.round(image.width * scale);
      const targetHeight = Math.round(image.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("CANVAS_ERROR");
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await canvasToBlob(canvas, input.format, input.quality);
      const url = URL.createObjectURL(blob);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(url);
      setResult(buildCompressionResult(file.size, blob.size, input.format));
    } catch {
      setError("Impossible de compresser cette image pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Image Compressor</h1>
        <p className="text-sm text-gray-600">
          Compresse une image localement dans ton navigateur (sans upload serveur).
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="image" className="block text-sm font-medium">
          Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="quality" className="block text-sm font-medium">
          Qualité ({qualityPercent}%)
        </label>
        <input
          id="quality"
          type="range"
          min={10}
          max={100}
          value={qualityPercent}
          onChange={(event) => setQualityPercent(Number.parseInt(event.target.value, 10))}
          className="w-full"
        />

        <label htmlFor="maxWidth" className="block text-sm font-medium">
          Largeur maximale (px)
        </label>
        <input
          id="maxWidth"
          type="number"
          min={200}
          max={4000}
          value={maxWidth}
          onChange={(event) => setMaxWidth(Number.parseInt(event.target.value || "1600", 10))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="format" className="block text-sm font-medium">
          Format de sortie
        </label>
        <select
          id="format"
          value={format}
          onChange={(event) => setFormat(event.target.value as ImageOutputFormat)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WEBP</option>
        </select>

        <button
          type="button"
          onClick={onCompress}
          disabled={loading || !file}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Compression..." : "Compresser l'image"}
        </button>
      </section>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Résultat</h2>
          <p className="text-sm text-gray-700">Taille originale: {formatBytes(result.originalSizeBytes)}</p>
          <p className="text-sm text-gray-700">Taille compressée: {formatBytes(result.compressedSizeBytes)}</p>
          <p className="text-sm text-gray-700">Réduction: {result.reductionPercent}%</p>

          {downloadUrl ? (
            <a
              href={downloadUrl}
              download={outputName}
              className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Télécharger l&apos;image compressée
            </a>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}