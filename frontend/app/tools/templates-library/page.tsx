"use client";

import { useEffect, useState } from "react";

type TemplateCategory = "landing" | "service" | "blog" | "portfolio";

interface SiteTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  sections: string[];
}

interface ApiSuccess {
  ok: true;
  data: {
    templates: SiteTemplate[];
  };
}

type CategoryFilter = "all" | TemplateCategory;

export default function TemplatesLibraryPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      setError(null);

      try {
        const query = category === "all" ? "" : `?category=${category}`;
        const response = await fetch(`/api/tools/templates-library${query}`);
        const payload = (await response.json()) as ApiSuccess;

        if (!response.ok || !payload.ok) {
          setError("Impossible de charger les templates.");
          return;
        }

        setTemplates(payload.data.templates);
      } catch {
        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, [category]);

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Templates Library</h1>
        <p className="text-sm text-gray-600">
          Bibliothèque simple de structures de pages prêtes à adapter.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 p-4">
        <label htmlFor="category" className="block text-sm font-medium">
          Catégorie
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as CategoryFilter)}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Toutes</option>
          <option value="landing">Landing</option>
          <option value="service">Service</option>
          <option value="blog">Blog</option>
          <option value="portfolio">Portfolio</option>
        </select>
      </section>

      {loading ? <p className="text-sm text-gray-600">Chargement...</p> : null}

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        {templates.map((template) => (
          <article key={template.id} className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{template.category}</p>
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <p className="mt-2 text-xs text-gray-500">Sections: {template.sections.join(" · ")}</p>
          </article>
        ))}
      </section>
    </main>
  );
}