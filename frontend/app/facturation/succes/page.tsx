"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FacturationSuccesPage() {
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function confirmAndRefresh() {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (sessionId) {
          const confirmResponse = await fetch("/api/billing/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          const confirmData = await confirmResponse.json();
          if (!confirmResponse.ok || !confirmData.ok) {
            if (!cancelled) {
              setState("error");
            }
            return;
          }
        }

        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (!cancelled && response.ok && data.ok) {
          setState("done");
          return;
        }

        if (!cancelled) {
          setState("error");
        }
      } catch {
        if (!cancelled) {
          setState("error");
        }
      }
    }

    confirmAndRefresh();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-xl">
      <h1 className="mb-3 text-2xl font-bold">Paiement reçu</h1>

      {state === "loading" ? <p>Mise à jour du compte en cours...</p> : null}
      {state === "done" ? (
        <p className="mb-4">Ton abonnement est actif. Tu peux maintenant utiliser tous les outils.</p>
      ) : null}
      {state === "error" ? (
        <p className="mb-4 text-red-600">
          Paiement effectué, mais la confirmation prend un peu de temps. Recharge la page dans quelques
          secondes.
        </p>
      ) : null}

      <Link href="/tools/site-analyzer" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
        Retour aux outils
      </Link>
    </main>
  );
}
