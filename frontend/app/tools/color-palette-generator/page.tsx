"use client";

import { FormEvent, useState } from "react";

type PaletteMode = "soft" | "vibrant" | "contrast";

interface PaletteColor {
  role: string;
  hex: string;
}

interface ColorPaletteResult {
  baseColor: string;
  mode: PaletteMode;
  palette: PaletteColor[];
}

interface ApiSuccess {
  ok: true;
  data: ColorPaletteResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function ColorPaletteGeneratorPage() {
  const [baseColor, setBaseColor] = useState("#3B82F6");
  const [mode, setMode] = useState<PaletteMode>("soft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ColorPaletteResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/color-palette-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseColor, mode }),
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
        <h1 className="text-3xl font-bold">Color Palette Generator</h1>
        <p className="text-sm text-gray-600">
          Génère une palette de couleurs simple à partir d&apos;une couleur de base.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="baseColor" className="block text-sm font-medium">
          Couleur de base (hex)
        </label>
        <input
          id="baseColor"
          type="text"
          value={baseColor}
          onChange={(event) => setBaseColor(event.target.value)}
          placeholder="#3B82F6"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="mode" className="block text-sm font-medium">
          Mode
        </label>
        <select
          id="mode"
          value={mode}
          onChange={(event) => setMode(event.target.value as PaletteMode)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="soft">Soft</option>
          <option value="vibrant">Vibrant</option>
          <option value="contrast">Contrast</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer la palette"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Palette générée</h2>
          <p className="text-sm text-gray-600">
            Base: {result.baseColor} · Mode: {result.mode}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {result.palette.map((color) => (
              <article key={`${color.role}-${color.hex}`} className="rounded-md border border-gray-200 p-3">
                <div className="mb-2 h-16 w-full rounded" style={{ backgroundColor: color.hex }} />
                <p className="text-sm font-semibold">{color.role}</p>
                <p className="text-sm text-gray-700">{color.hex}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}