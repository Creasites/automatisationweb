import Link from "next/link";

const roadmapItems = [
  { step: "Étape 1", title: "Socle plateforme", status: "Terminé" },
  { step: "Étape 2", title: "Modules d'analyse", status: "Terminé" },
  { step: "Étape 3", title: "Générateurs & outils pratiques", status: "Terminé" },
  { step: "Étape 4", title: "Pages business (légal + templates)", status: "Terminé" },
  { step: "Étape 5", title: "Amélioration UX et déploiement", status: "En cours" },
  { step: "Étape 6", title: "Base SaaS website builder", status: "À venir" },
];

export default function AboutPage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">À propos de Creasites</h1>
        <p className="text-gray-600">
          Creasites est une plateforme modulaire d&apos;outils web simples, rapides et utiles.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold">Vision</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Construire une base propre, lisible et extensible.</li>
          <li>Ajouter les modules un par un sans casser les autres.</li>
          <li>Évoluer vers une plateforme de création de site (website builder SaaS).</li>
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold">Principes</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Un module = une responsabilité unique.</li>
          <li>Code clair et pédagogique avant complexité technique.</li>
          <li>MVP fonctionnel d&apos;abord, optimisation ensuite.</li>
          <li>Fonctionnalité avant esthétique complexe.</li>
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold">Roadmap</h2>
        <ul className="mt-3 space-y-2">
          {roadmapItems.map((item) => (
            <li key={item.step} className="rounded-md border border-gray-200 p-3">
              <p className="text-sm font-semibold">
                {item.step} · {item.title}
              </p>
              <p className="text-xs text-gray-600">Statut: {item.status}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold">Accès rapide</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Retour accueil
          </Link>
          <Link href="/tools/site-analyzer" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium">
            Ouvrir un module
          </Link>
        </div>
      </section>
    </main>
  );
}