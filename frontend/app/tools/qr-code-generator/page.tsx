"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

interface QrCodeResult {
  text: string;
  size: number;
  margin: number;
  format: "png";
  imageUrl: string;
}

interface ApiSuccess {
  ok: true;
  data: QrCodeResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrCodeResult | null>(null);

  const fileName = useMemo(() => {
    const safe = text.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
    return safe ? `qrcode-${safe}.png` : "qrcode-creasites.png";
  }, [text]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/qr-code-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, size, margin }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Erreur inconnue." : payload.error);
        return;
      }

      setResult(payload.data);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">QR Code Generator</h1>
        <p className="text-sm text-gray-600">
          Génère un QR code PNG à partir d&apos;un texte, d&apos;un lien ou d&apos;une information courte.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="text" className="block text-sm font-medium">
          Texte / Lien
        </label>
        <input
          id="text"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="https://exemple.com"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="size" className="block text-sm font-medium">
          Taille (px)
        </label>
        <input
          id="size"
          type="number"
          min={128}
          max={1024}
          value={size}
          onChange={(event) => setSize(Number.parseInt(event.target.value || "320", 10))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="margin" className="block text-sm font-medium">
          Marge
        </label>
        <input
          id="margin"
          type="number"
          min={0}
          max={8}
          value={margin}
          onChange={(event) => setMargin(Number.parseInt(event.target.value || "2", 10))}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer le QR code"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Résultat</h2>
          <p className="text-sm text-gray-600">
            Taille: {result.size}px · Marge: {result.margin}
          </p>

          <Image
            src={result.imageUrl}
            alt="QR code généré"
            width={320}
            height={320}
            className="h-auto max-w-[320px] rounded border border-gray-200"
          />

          <a
            href={result.imageUrl}
            download={fileName}
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Télécharger le PNG
          </a>
        </section>
      ) : null}
    </main>
  );
}