"use client";

import { FormEvent, useState } from "react";

type LegalPageType = "mentions-legales" | "politique-confidentialite" | "cgu";

interface LegalGeneratorResult {
  pageType: LegalPageType;
  title: string;
  content: string;
}

interface ApiSuccess {
  ok: true;
  data: LegalGeneratorResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function LegalPagesGeneratorPage() {
  const [pageType, setPageType] = useState<LegalPageType>("mentions-legales");
  const [companyName, setCompanyName] = useState("");
  const [websiteName, setWebsiteName] = useState("Creasites");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("France");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LegalGeneratorResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/legal-pages-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageType,
          companyName,
          websiteName,
          contactEmail,
          country,
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
        <h1 className="text-3xl font-bold">Legal Pages Generator</h1>
        <p className="text-sm text-gray-600">
          Génère une base de page légale en français (à relire et adapter juridiquement).
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium" htmlFor="pageType">
          Type de page
        </label>
        <select
          id="pageType"
          value={pageType}
          onChange={(event) => setPageType(event.target.value as LegalPageType)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="mentions-legales">Mentions légales</option>
          <option value="politique-confidentialite">Politique de confidentialité</option>
          <option value="cgu">CGU</option>
        </select>

        <input
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Nom de l'entreprise"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={websiteName}
          onChange={(event) => setWebsiteName(event.target.value)}
          placeholder="Nom du site"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          placeholder="Email de contact"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          placeholder="Pays"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

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
          <h2 className="text-lg font-semibold">{result.title}</h2>
          <textarea
            readOnly
            value={result.content}
            rows={14}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          />
        </section>
      ) : null}
    </main>
  );
}