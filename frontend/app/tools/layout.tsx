import Link from "next/link";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tools-layout space-y-6">
      <section className="rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5">
        <p className="text-xs uppercase tracking-wide text-gray-500">Creasites · Outils</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Bibliothèque d&apos;outils</h1>
        <p className="mt-2 text-sm text-gray-600">
          Même structure sur toutes les pages: formulaire clair, feedback immédiat, résultat lisible.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-black"
        >
          Retour à l&apos;accueil
        </Link>
      </section>

      <div className="space-y-6">{children}</div>
    </div>
  );
}