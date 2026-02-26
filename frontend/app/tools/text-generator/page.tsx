"use client";

import { FormEvent, useState } from "react";

type TextTone = "neutre" | "professionnel" | "dynamique";
type TextFormat = "description" | "accroche" | "cta";

interface TextGeneratorResult {
  topic: string;
  format: TextFormat;
  tone: TextTone;
  generatedText: string;
}

interface ApiSuccess {
  ok: true;
  data: TextGeneratorResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function TextGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<TextFormat>("description");
  const [tone, setTone] = useState<TextTone>("neutre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextGeneratorResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/text-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, format, tone }),
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
        <h1 className="text-3xl font-bold">Text Generator</h1>
        <p className="text-sm text-gray-600">
          Génère un texte court en français selon un sujet, un format et un ton.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="topic" className="block text-sm font-medium">
          Sujet
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Exemple: création de site web"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="format" className="block text-sm font-medium">
          Format
        </label>
        <select
          id="format"
          value={format}
          onChange={(event) => setFormat(event.target.value as TextFormat)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="description">Description</option>
          <option value="accroche">Accroche</option>
          <option value="cta">Call to action</option>
        </select>

        <label htmlFor="tone" className="block text-sm font-medium">
          Ton
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(event) => setTone(event.target.value as TextTone)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="neutre">Neutre</option>
          <option value="professionnel">Professionnel</option>
          <option value="dynamique">Dynamique</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Texte généré</h2>
          <p className="text-sm text-gray-600">
            Sujet: {result.topic} · Format: {result.format} · Ton: {result.tone}
          </p>
          <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-800">
            {result.generatedText}
          </p>
        </section>
      ) : null}
    </main>
  );
}