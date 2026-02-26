import { SpeedCheck, SpeedTestInput, SpeedTestResult } from "./types";

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function collectSuggestions(checks: SpeedCheck[]): string[] {
  const suggestions = checks
    .filter((check) => check.status !== "ok")
    .map((check) => `- ${check.message}`);
  return [...new Set(suggestions)];
}

function checkStatus(condition: boolean): "ok" | "attention" {
  return condition ? "ok" : "attention";
}

function countPattern(html: string, pattern: RegExp): number {
  return (html.match(pattern) ?? []).length;
}

export async function runSpeedTest(input: SpeedTestInput): Promise<SpeedTestResult> {
  const normalizedUrl = normalizeUrl(input.url);
  const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const totalStart = Date.now();
    const response = await fetch(normalizedUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Creasites-SpeedTest/1.0",
      },
    });
    const responseTimeMs = Date.now() - totalStart;

    const textStart = Date.now();
    const html = await response.text();
    const totalTimeMs = Date.now() - totalStart + (Date.now() - textStart);

    const htmlSizeBytes = Buffer.byteLength(html, "utf8");
    const htmlSizeKb = Number((htmlSizeBytes / 1024).toFixed(2));

    const contentLengthHeader = response.headers.get("content-length") ?? "";
    const cacheControl = response.headers.get("cache-control") ?? "";
    const compression = response.headers.get("content-encoding") ?? "";

    const scriptCount = countPattern(html, /<script\b/gi);
    const cssCount = countPattern(html, /<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi);
    const imageCount = countPattern(html, /<img\b/gi);
    const lazyImageCount = countPattern(html, /<img[^>]+loading=["']lazy["'][^>]*>/gi);

    const checks: SpeedCheck[] = [
      {
        id: "http-status",
        label: "Réponse HTTP",
        status: response.ok ? "ok" : "error",
        message: response.ok
          ? "Le site répond correctement."
          : "Le site ne répond pas correctement (status HTTP non valide).",
        value: String(response.status),
      },
      {
        id: "response-time",
        label: "Temps de réponse serveur",
        status: checkStatus(responseTimeMs <= 1200),
        message:
          responseTimeMs <= 1200
            ? "Le temps de réponse est correct."
            : "Réduis le temps de réponse serveur (objectif < 1200 ms).",
        value: `${responseTimeMs} ms`,
      },
      {
        id: "html-size",
        label: "Taille HTML",
        status: checkStatus(htmlSizeKb <= 250),
        message:
          htmlSizeKb <= 250
            ? "La taille HTML est raisonnable."
            : "Réduis la taille du HTML (objectif < 250 KB).",
        value: `${htmlSizeKb} KB`,
      },
      {
        id: "cache-control",
        label: "Header Cache-Control",
        status: checkStatus(cacheControl.length > 0),
        message:
          cacheControl.length > 0
            ? "Le cache-control est présent."
            : "Ajoute un header Cache-Control.",
        value: cacheControl || undefined,
      },
      {
        id: "compression",
        label: "Compression HTTP",
        status: checkStatus(compression.length > 0),
        message:
          compression.length > 0
            ? "Une compression est détectée."
            : "Active la compression HTTP (gzip ou br).",
        value: compression || undefined,
      },
      {
        id: "script-count",
        label: "Nombre de scripts",
        status: checkStatus(scriptCount <= 20),
        message:
          scriptCount <= 20
            ? "Le nombre de scripts est raisonnable."
            : "Réduis le nombre de scripts chargés.",
        value: String(scriptCount),
      },
      {
        id: "css-count",
        label: "Nombre de CSS",
        status: checkStatus(cssCount <= 10),
        message:
          cssCount <= 10
            ? "Le nombre de feuilles CSS est raisonnable."
            : "Réduis le nombre de fichiers CSS.",
        value: String(cssCount),
      },
      {
        id: "lazy-images",
        label: "Images en lazy loading",
        status: checkStatus(imageCount === 0 || lazyImageCount >= Math.ceil(imageCount * 0.5)),
        message:
          imageCount === 0 || lazyImageCount >= Math.ceil(imageCount * 0.5)
            ? "Le lazy loading des images est bien utilisé."
            : "Ajoute loading=\"lazy\" sur les images non critiques.",
        value: `${lazyImageCount}/${imageCount}`,
      },
      {
        id: "content-length",
        label: "Header Content-Length",
        status: checkStatus(contentLengthHeader.length > 0),
        message:
          contentLengthHeader.length > 0
            ? "Le content-length est présent."
            : "Ajoute un header Content-Length si possible.",
        value: contentLengthHeader || undefined,
      },
    ];

    const okCount = checks.filter((check) => check.status === "ok").length;
    const score = Math.round((okCount / checks.length) * 100);

    return {
      normalizedUrl,
      httpStatus: response.status,
      responseTimeMs,
      totalTimeMs,
      htmlSizeKb,
      score,
      checks,
      suggestions: collectSuggestions(checks),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}