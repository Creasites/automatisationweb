"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Mode = "login" | "register";

type ApiResponse = {
  ok: boolean;
  error?: string;
};

export default function ConnexionPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/tools/site-analyzer");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) {
      setNextPath(next);
    }
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Erreur de connexion.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Connexion</h1>
      <p className="mb-6 text-sm text-gray-600">
        Crée ton compte pour démarrer l’essai gratuit 5 jours puis passer à l’abonnement.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded-md border px-3 py-2 text-sm font-medium ${
            mode === "login" ? "border-black bg-black text-white" : "border-gray-300"
          }`}
          onClick={() => setMode("login")}
        >
          Se connecter
        </button>
        <button
          type="button"
          className={`rounded-md border px-3 py-2 text-sm font-medium ${
            mode === "register" ? "border-black bg-black text-white" : "border-gray-300"
          }`}
          onClick={() => setMode("register")}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 p-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="toi@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="8 caractères minimum"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Besoin des détails de l’offre ? <Link href="/tarifs" className="underline">Voir les tarifs</Link>
      </p>
    </main>
  );
}
