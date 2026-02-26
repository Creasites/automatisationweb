"use client";

import { FormEvent, useState } from "react";

interface MetaTagEntry {
  key: string;
  value: string;
}

interface MetaTagsResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  title: string;
  metaTags: MetaTagEntry[];
  linkTags: MetaTagEntry[];
}

interface ApiSuccess {
  ok: true;
  data: MetaTagsResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function MetaTagsExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MetaTagsResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/meta-tags-extractor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
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
        <h1 className="text-3xl font-bold">Meta Tags Extractor</h1>
        <p className="text-sm text-gray-600">
          Extrait rapidement les balises meta et link d&apos;une URL (10 secondes max).
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="url" className="block text-sm font-medium">
          URL du site
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://exemple.com"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Extraction en cours..." : "Extraire"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Résumé</h2>
            <p className="mt-2 text-sm">URL normalisée: {result.normalizedUrl}</p>
            <p className="text-sm">Status HTTP: {result.httpStatus ?? "N/A"}</p>
            <p className="text-sm">Temps de réponse: {result.responseTimeMs ?? "N/A"} ms</p>
            <p className="text-sm">Title: {result.title || "(vide)"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Meta tags</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {result.metaTags.length === 0 ? (
                <li>Aucune meta tag trouvée.</li>
              ) : (
                result.metaTags.map((entry) => (
                  <li key={`${entry.key}-${entry.value}`}>{entry.key}: {entry.value}</li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Link tags</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {result.linkTags.length === 0 ? (
                <li>Aucune link tag trouvée.</li>
              ) : (
                result.linkTags.map((entry) => (
                  <li key={`${entry.key}-${entry.value}`}>{entry.key}: {entry.value}</li>
                ))
              )}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}