"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toolModules } from "@modules/registry";

const categoryConfig = {
  analyse: {
    title: "Analyse / Diagnostic",
    description: "Modules pour auditer et vérifier un site web.",
  },
  generateur: {
    title: "Générateurs",
    description: "Modules pour générer du contenu et des structures.",
  },
  pratique: {
    title: "Outils pratiques",
    description: "Modules utiles au quotidien pour manipuler des données et médias.",
  },
  business: {
    title: "Business / Web",
    description: "Modules pour les besoins business et la préparation de sites.",
  },
} as const;

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return toolModules;
    }

    return toolModules.filter((tool) => {
      const haystack = `${tool.label} ${tool.description} ${tool.id}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  const groupedTools = useMemo(
    () => ({
      analyse: filteredTools.filter((tool) => tool.category === "analyse"),
      generateur: filteredTools.filter((tool) => tool.category === "generateur"),
      pratique: filteredTools.filter((tool) => tool.category === "pratique"),
      business: filteredTools.filter((tool) => tool.category === "business"),
    }),
    [filteredTools],
  );

  const totalModules = toolModules.length;
  const totalCategories = Object.keys(categoryConfig).length;

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plateforme modulaire</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Crée, analyse et améliore des sites web</h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          Creasites rassemble des outils web simples, rapides et utiles dans une seule interface claire.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            {totalModules} modules disponibles
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            {totalCategories} catégories
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            MVP fonctionnel
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-600">Découvrir le projet, les principes et la roadmap de Creasites.</p>
        <Link href="/a-propos" className="mt-3 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
          Voir la page À propos / Roadmap
        </Link>
      </section>

      <section className="rounded-xl border border-gray-200 p-4">
        <label htmlFor="search" className="mb-2 block text-sm font-medium">
          Rechercher un module
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Exemple: seo, qr, image..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">{filteredTools.length} module(s) trouvé(s)</p>
      </section>

      {filteredTools.length === 0 ? (
        <section className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
          Aucun module ne correspond à cette recherche.
        </section>
      ) : null}

      {Object.entries(groupedTools).map(([category, tools]) => (
        <section key={category} className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-1 text-xl font-semibold tracking-tight">
            {categoryConfig[category as keyof typeof categoryConfig].title}
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            {categoryConfig[category as keyof typeof categoryConfig].description}
          </p>

          {tools.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun module dans cette catégorie pour le moment.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <li key={tool.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-base font-semibold">{tool.label}</p>
                  <p className="mb-3 mt-1 text-sm text-gray-600">{tool.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500">
                      {tool.id}
                    </span>
                    <Link
                      href={tool.uiPath}
                      className="inline-flex rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Ouvrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
