"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BillingPlan = "monthly" | "yearly";

type AccessData = {
  email: string;
  subscriptionStatus: "inactive" | "active";
  access: {
    hasAccess: boolean;
    reason: "active_subscription" | "trial" | "expired";
    trialDaysLeft: number;
  };
};

export default function TarifsPage() {
  const [user, setUser] = useState<AccessData | null>(null);
  const [plan, setPlan] = useState<BillingPlan>("monthly");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();

      if (!cancelled && response.ok && data.ok) {
        setUser(data.data as AccessData);
      }
    }

    loadUser().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function startCheckout() {
    setLoadingCheckout(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok || !data.data?.url) {
        setError(data.error ?? "Impossible de lancer le paiement.");
        return;
      }

      window.location.href = data.data.url;
    } catch {
      setError("Erreur réseau pendant le checkout.");
    } finally {
      setLoadingCheckout(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Tarifs</h1>
      <p className="mb-6 text-sm text-gray-600">
        Essai gratuit 5 jours (illimité), puis 4,99€/mois ou 49,90€/an (2 mois offerts).
      </p>

      <div className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <p className="text-sm text-gray-600">Choisis ton plan</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`rounded-lg border p-4 text-left ${
              plan === "monthly" ? "border-black" : "border-gray-200"
            }`}
          >
            <p className="text-sm text-gray-600">Mensuel</p>
            <p className="mt-1 text-2xl font-bold">4,99€ / mois</p>
          </button>

          <button
            type="button"
            onClick={() => setPlan("yearly")}
            className={`relative rounded-lg border p-4 text-left ${
              plan === "yearly" ? "border-black" : "border-gray-200"
            }`}
          >
            <span className="absolute right-3 top-3 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
              Économise 2 mois
            </span>
            <p className="text-sm text-gray-600">Annuel</p>
            <p className="mt-1 text-2xl font-bold">49,90€ / an</p>
            <p className="mt-1 text-sm text-gray-700">2 mois offerts</p>
          </button>
        </div>

        <ul className="mt-1 space-y-2 text-sm">
          <li>• Tous les modules inclus</li>
          <li>• Usage illimité</li>
          <li>• Essai gratuit 5 jours</li>
        </ul>

        {user ? (
          <div className="mt-5 rounded-lg border border-gray-200 p-3 text-sm">
            <p>
              Connecté: <strong>{user.email}</strong>
            </p>
            <p>
              Statut: <strong>{user.subscriptionStatus === "active" ? "Abonné" : "Non abonné"}</strong>
            </p>
            <p>
              Accès actuel: <strong>{user.access.hasAccess ? "Autorisé" : "Expiré"}</strong>
            </p>
          </div>
        ) : (
          <p className="mt-5 text-sm">
            <Link href="/connexion?next=/tarifs" className="underline">
              Connecte-toi
            </Link>{" "}
            pour activer l’offre.
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            disabled={!user || loadingCheckout || user.subscriptionStatus === "active"}
            onClick={startCheckout}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loadingCheckout
              ? "Redirection..."
              : user?.subscriptionStatus === "active"
                ? "Abonnement actif"
                : plan === "yearly"
                  ? "S’abonner à l’offre annuelle"
                  : "S’abonner à l’offre mensuelle"}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
