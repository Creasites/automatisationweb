"use client";

import { FormEvent, useState } from "react";

type PageType = "landing" | "service" | "blog";
type PageGoal = "conversion" | "information" | "contact";

interface PageSection {
  title: string;
  objective: string;
}

interface PageStructureResult {
  topic: string;
  pageType: PageType;
  goal: PageGoal;
  sections: PageSection[];
}

interface ApiSuccess {
  ok: true;
  data: PageStructureResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function PageStructureGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [pageType, setPageType] = useState<PageType>("landing");
  const [goal, setGoal] = useState<PageGoal>("conversion");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PageStructureResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/page-structure-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, pageType, goal }),
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
        <h1 className="text-3xl font-bold">Page Structure Generator</h1>
        <p className="text-sm text-gray-600">
          Génère une structure de page claire selon ton sujet, ton type de page et ton objectif.
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
          placeholder="Exemple: agence web locale"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="pageType" className="block text-sm font-medium">
          Type de page
        </label>
        <select
          id="pageType"
          value={pageType}
          onChange={(event) => setPageType(event.target.value as PageType)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="landing">Landing page</option>
          <option value="service">Page service</option>
          <option value="blog">Article de blog</option>
        </select>

        <label htmlFor="goal" className="block text-sm font-medium">
          Objectif
        </label>
        <select
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value as PageGoal)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="conversion">Conversion</option>
          <option value="information">Information</option>
          <option value="contact">Contact</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer la structure"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Structure proposée</h2>
          <p className="text-sm text-gray-600">
            Sujet: {result.topic} · Type: {result.pageType} · Objectif: {result.goal}
          </p>
          <ol className="space-y-2 pl-5">
            {result.sections.map((section, index) => (
              <li key={`${section.title}-${index}`} className="rounded-md bg-gray-50 p-3">
                <p className="text-sm font-semibold">{index + 1}. {section.title}</p>
                <p className="text-sm text-gray-700">{section.objective}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}