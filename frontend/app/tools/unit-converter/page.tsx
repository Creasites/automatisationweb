"use client";

import { FormEvent, useMemo, useState } from "react";

type ConverterCategory = "length" | "weight" | "temperature";
type ConverterUnit = "m" | "km" | "cm" | "mm" | "kg" | "g" | "lb" | "c" | "f" | "k";

interface ConverterResult {
  category: ConverterCategory;
  inputValue: number;
  fromUnit: ConverterUnit;
  toUnit: ConverterUnit;
  outputValue: number;
  formulaHint: string;
}

interface ApiSuccess {
  ok: true;
  data: ConverterResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

function unitsByCategory(category: ConverterCategory): ConverterUnit[] {
  if (category === "length") {
    return ["mm", "cm", "m", "km"];
  }
  if (category === "weight") {
    return ["g", "kg", "lb"];
  }
  return ["c", "f", "k"];
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<ConverterCategory>("length");
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<ConverterUnit>("m");
  const [toUnit, setToUnit] = useState<ConverterUnit>("km");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConverterResult | null>(null);

  const availableUnits = useMemo(() => unitsByCategory(category), [category]);

  function onChangeCategory(nextCategory: ConverterCategory) {
    const nextUnits = unitsByCategory(nextCategory);
    setCategory(nextCategory);
    setFromUnit(nextUnits[0]);
    setToUnit(nextUnits[1] ?? nextUnits[0]);
    setResult(null);
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const numericValue = Number.parseFloat(value);

    try {
      const response = await fetch("/api/tools/unit-converter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          value: numericValue,
          fromUnit,
          toUnit,
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
        <h1 className="text-3xl font-bold">Format / Unit Converters</h1>
        <p className="text-sm text-gray-600">
          Convertit rapidement des unités de longueur, poids et température.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="category" className="block text-sm font-medium">
          Catégorie
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => onChangeCategory(event.target.value as ConverterCategory)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="length">Longueur</option>
          <option value="weight">Poids</option>
          <option value="temperature">Température</option>
        </select>

        <label htmlFor="value" className="block text-sm font-medium">
          Valeur
        </label>
        <input
          id="value"
          type="number"
          step="any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <label htmlFor="fromUnit" className="block text-sm font-medium">
          De
        </label>
        <select
          id="fromUnit"
          value={fromUnit}
          onChange={(event) => setFromUnit(event.target.value as ConverterUnit)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {availableUnits.map((unit) => (
            <option key={`from-${unit}`} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <label htmlFor="toUnit" className="block text-sm font-medium">
          Vers
        </label>
        <select
          id="toUnit"
          value={toUnit}
          onChange={(event) => setToUnit(event.target.value as ConverterUnit)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {availableUnits.map((unit) => (
            <option key={`to-${unit}`} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Conversion..." : "Convertir"}
        </button>
      </form>

      {error ? (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Résultat</h2>
          <p className="text-sm text-gray-700">
            {result.inputValue} {result.fromUnit} = {result.outputValue} {result.toUnit}
          </p>
          <p className="text-xs text-gray-500">{result.formulaHint}</p>
        </section>
      ) : null}
    </main>
  );
}