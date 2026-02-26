"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

interface FaviconResult {
  letter: string;
  backgroundColor: string;
  textColor: string;
  rounded: boolean;
  svg: string;
  dataUrl: string;
  htmlSnippet: string;
}

interface ApiSuccess {
  ok: true;
  data: FaviconResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function FaviconGeneratorPage() {
  const [letter, setLetter] = useState("C");
  const [backgroundColor, setBackgroundColor] = useState("#1D4ED8");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [rounded, setRounded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FaviconResult | null>(null);

  const downloadHref = useMemo(() => {
    if (!result) {
      return "";
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`;
  }, [result]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/favicon-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letter,
          backgroundColor,
          textColor,
          rounded,
        }),
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
        <h1 className="text-3xl font-bold">Favicon Generator</h1>
        <p className="text-sm text-gray-600">
          Génère un favicon SVG simple avec une lettre et deux couleurs.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="letter" className="block text-sm font-medium">
          Lettre
        </label>
        <input
          id="letter"
          type="text"
          value={letter}
          maxLength={2}
          onChange={(event) => setLetter(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="backgroundColor" className="block text-sm font-medium">
          Couleur de fond
        </label>
        <input
          id="backgroundColor"
          type="text"
          value={backgroundColor}
          onChange={(event) => setBackgroundColor(event.target.value)}
          placeholder="#1D4ED8"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="textColor" className="block text-sm font-medium">
          Couleur du texte
        </label>
        <input
          id="textColor"
          type="text"
          value={textColor}
          onChange={(event) => setTextColor(event.target.value)}
          placeholder="#FFFFFF"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rounded}
            onChange={(event) => setRounded(event.target.checked)}
          />
          Bords arrondis
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer le favicon"}
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

          <Image
            src={result.dataUrl}
            alt="Aperçu du favicon"
            width={96}
            height={96}
            className="rounded border border-gray-200"
          />

          <div className="flex flex-wrap gap-2">
            <a
              href={downloadHref}
              download="favicon.svg"
              className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Télécharger SVG
            </a>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Snippet HTML</p>
            <textarea
              readOnly
              value={result.htmlSnippet}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}