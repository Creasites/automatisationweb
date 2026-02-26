"use client";

import { FormEvent, useState } from "react";

type CodecType = "base64" | "url";
type CodecAction = "encode" | "decode";

interface CodecResult {
  codec: CodecType;
  action: CodecAction;
  inputText: string;
  outputText: string;
}

interface ApiSuccess {
  ok: true;
  data: CodecResult;
}

interface ApiError {
  ok: false;
  error: string;
}

type ApiResponse = ApiSuccess | ApiError;

export default function EncoderDecoderToolsPage() {
  const [text, setText] = useState("");
  const [codec, setCodec] = useState<CodecType>("base64");
  const [action, setAction] = useState<CodecAction>("encode");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodecResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/encoder-decoder-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, codec, action }),
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
        <h1 className="text-3xl font-bold">Encoder / Decoder Tools</h1>
        <p className="text-sm text-gray-600">
          Encode ou décode du texte en Base64 ou URL de manière rapide.
        </p>
      </section>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
        <label htmlFor="codec" className="block text-sm font-medium">
          Codec
        </label>
        <select
          id="codec"
          value={codec}
          onChange={(event) => setCodec(event.target.value as CodecType)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="base64">Base64</option>
          <option value="url">URL</option>
        </select>

        <label htmlFor="action" className="block text-sm font-medium">
          Action
        </label>
        <select
          id="action"
          value={action}
          onChange={(event) => setAction(event.target.value as CodecAction)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="encode">Encoder</option>
          <option value="decode">Décoder</option>
        </select>

        <label htmlFor="text" className="block text-sm font-medium">
          Texte
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Colle ton texte ici..."
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Traitement..." : "Exécuter"}
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
          <p className="text-sm text-gray-600">
            Codec: {result.codec} · Action: {result.action}
          </p>
          <textarea
            readOnly
            value={result.outputText}
            rows={8}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          />
        </section>
      ) : null}
    </main>
  );
}