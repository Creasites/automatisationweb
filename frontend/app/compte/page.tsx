"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MeData = {
  email: string;
  subscriptionStatus: "inactive" | "active";
  trialEndsAt: string;
  access: {
    hasAccess: boolean;
    reason: "active_subscription" | "trial" | "expired";
    trialDaysLeft: number;
  };
};

export default function ComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          router.push("/connexion?next=/compte");
          return;
        }

        if (!cancelled) {
          setMe(data.data as MeData);
        }
      } catch {
        if (!cancelled) {
          setError("Impossible de charger le compte.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <p>Chargement du compte...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!me) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Mon compte</h1>
      <p className="mb-6 text-sm text-gray-600">{me.email}</p>

      <div className="space-y-3 rounded-xl border border-gray-200 p-5">
        <p>
          <strong>Abonnement:</strong> {me.subscriptionStatus === "active" ? "Actif" : "Inactif"}
        </p>
        <p>
          <strong>Accès outils:</strong> {me.access.hasAccess ? "Autorisé" : "Bloqué"}
        </p>
        <p>
          <strong>Fin d’essai:</strong> {new Date(me.trialEndsAt).toLocaleDateString("fr-FR")}
        </p>
        <p>
          <strong>Jours restants d’essai:</strong> {me.access.trialDaysLeft}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/tarifs")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
        >
          Gérer l’offre
        </button>
        <button
          type="button"
          onClick={logout}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Se déconnecter
        </button>
      </div>
    </main>
  );
}
