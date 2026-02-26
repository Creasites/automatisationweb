"use client";

import { FormEvent, useState } from "react";

type CheckStatus = "ok" | "attention" | "error";

interface AnalyzerCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: string;
}

interface AnalyzerResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  score: number;
  checks: AnalyzerCheck[];
  suggestions: string[];
}

interface ApiSuccess {
  ok: true;
  data: AnalyzerResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

function statusStyle(status: CheckStatus): string {
  if (status === "ok") {
    return "border-green-200 bg-green-50";
  }

  if (status === "attention") {
    return "border-yellow-200 bg-yellow-50";
  }

  return "border-red-200 bg-red-50";
}

function statusIcon(status: CheckStatus): string {
  if (status === "ok") {
    return "✅";
  }

  if (status === "attention") {
    return "⚠️";
  }

  return "❌";
}

export default function SiteAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/site-analyzer", {
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
        <h1 className="text-3xl font-bold">Site Analyzer</h1>
        <p className="text-sm text-gray-600">
          Analyse une URL avec HTML + headers HTTP uniquement (10 secondes max).
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
          {loading ? "Analyse en cours..." : "Analyser"}
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
            <p className="mt-2 text-base font-semibold">Score simple: {result.score}/100</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Vérifications</h2>
            {result.checks.map((check) => (
              <article
                key={check.id}
                className={`rounded-md border p-3 text-sm ${statusStyle(check.status)}`}
              >
                <p className="font-semibold">
                  {statusIcon(check.status)} {check.label}
                </p>
                <p>{check.message}</p>
                {check.value ? <p className="mt-1 text-xs text-gray-700">Valeur: {check.value}</p> : null}
              </article>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Actions conseillées</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {result.suggestions.length === 0 ? (
                <li>Aucune action urgente détectée.</li>
              ) : (
                result.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)
              )}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}