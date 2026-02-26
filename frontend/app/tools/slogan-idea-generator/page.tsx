"use client";

import { FormEvent, useState } from "react";

type IdeaTone = "neutre" | "professionnel" | "creatif";

interface SloganIdeaResult {
  topic: string;
  tone: IdeaTone;
  slogan: string;
  idea: string;
}

interface ApiSuccess {
  ok: true;
  data: SloganIdeaResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function SloganIdeaGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<IdeaTone>("neutre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SloganIdeaResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/slogan-idea-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, tone }),
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
        <h1 className="text-3xl font-bold">Slogan / Idea Generator</h1>
        <p className="text-sm text-gray-600">
          Génère un slogan et une idée de contenu à partir d&apos;un sujet.
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
          placeholder="Exemple: marketing digital"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="tone" className="block text-sm font-medium">
          Ton
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(event) => setTone(event.target.value as IdeaTone)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="neutre">Neutre</option>
          <option value="professionnel">Professionnel</option>
          <option value="creatif">Créatif</option>
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
          <h2 className="text-lg font-semibold">Résultat</h2>
          <p className="text-sm text-gray-600">
            Sujet: {result.topic} · Ton: {result.tone}
          </p>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="mb-1 text-xs uppercase text-gray-500">Slogan</p>
            <p className="text-sm text-gray-800">{result.slogan}</p>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="mb-1 text-xs uppercase text-gray-500">Idée</p>
            <p className="text-sm text-gray-800">{result.idea}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}