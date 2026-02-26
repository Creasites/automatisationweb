import { AnalyzerCheck, AnalyzerInput, AnalyzerResult } from "./types";

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function uniqueSuggestions(checks: AnalyzerCheck[]): string[] {
  const suggestions = checks
    .filter((check) => check.status !== "ok")
    .map((check) => `- ${check.message}`);
  return [...new Set(suggestions)];
}

function checkStatus(condition: boolean): "ok" | "attention" {
  return condition ? "ok" : "attention";
}

function extractFirstMatch(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  if (!match || !match[1]) {
    return "";
  }

  return match[1].trim();
}

export async function analyzeSite(input: AnalyzerInput): Promise<AnalyzerResult> {
  const normalizedUrl = normalizeUrl(input.url);
  const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const start = Date.now();
    const response = await fetch(normalizedUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Creasites-SiteAnalyzer/1.0",
      },
    });
    const responseTimeMs = Date.now() - start;
    const html = await response.text();

    const title = extractFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = extractFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
    const h1 = extractFirstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "");
    const htmlLang = extractFirstMatch(html, /<html[^>]+lang=["']([^"']+)["'][^>]*>/i);
    const canonical = extractFirstMatch(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    );

    const contentType = response.headers.get("content-type") ?? "";
    const cacheControl = response.headers.get("cache-control") ?? "";
    const strictTransportSecurity = response.headers.get("strict-transport-security") ?? "";

    const checks: AnalyzerCheck[] = [
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
        id: "https",
        label: "HTTPS",
        status: checkStatus(normalizedUrl.startsWith("https://")),
        message: normalizedUrl.startsWith("https://")
          ? "Le site utilise HTTPS."
          : "Passe le site en HTTPS.",
      },
      {
        id: "title",
        label: "Balise title",
        status: checkStatus(title.length > 0),
        message: title.length > 0 ? "La balise title est présente." : "Ajoute une balise title.",
        value: title || undefined,
      },
      {
        id: "meta-description",
        label: "Meta description",
        status: checkStatus(description.length > 0),
        message:
          description.length > 0
            ? "La meta description est présente."
            : "Ajoute une meta description.",
        value: description || undefined,
      },
      {
        id: "h1",
        label: "Titre H1",
        status: checkStatus(h1.length > 0),
        message: h1.length > 0 ? "Un H1 est présent." : "Ajoute un titre H1.",
        value: h1 || undefined,
      },
      {
        id: "lang",
        label: "Attribut lang",
        status: checkStatus(htmlLang.length > 0),
        message:
          htmlLang.length > 0
            ? "L'attribut lang est défini."
            : "Ajoute l'attribut lang sur la balise html.",
        value: htmlLang || undefined,
      },
      {
        id: "canonical",
        label: "Lien canonical",
        status: checkStatus(canonical.length > 0),
        message:
          canonical.length > 0
            ? "Le lien canonical est présent."
            : "Ajoute un lien canonical.",
        value: canonical || undefined,
      },
      {
        id: "content-type",
        label: "Header Content-Type",
        status: checkStatus(contentType.toLowerCase().includes("text/html")),
        message: contentType
          ? "Le header Content-Type est présent."
          : "Ajoute le header Content-Type.",
        value: contentType || undefined,
      },
      {
        id: "cache-control",
        label: "Header Cache-Control",
        status: checkStatus(cacheControl.length > 0),
        message:
          cacheControl.length > 0
            ? "Le header Cache-Control est présent."
            : "Ajoute un header Cache-Control.",
        value: cacheControl || undefined,
      },
      {
        id: "hsts",
        label: "Header Strict-Transport-Security",
        status: checkStatus(strictTransportSecurity.length > 0),
        message:
          strictTransportSecurity.length > 0
            ? "Le header HSTS est présent."
            : "Ajoute le header Strict-Transport-Security.",
        value: strictTransportSecurity || undefined,
      },
    ];

    const okCount = checks.filter((check) => check.status === "ok").length;
    const score = Math.round((okCount / checks.length) * 100);

    return {
      normalizedUrl,
      httpStatus: response.status,
      responseTimeMs,
      score,
      checks,
      suggestions: uniqueSuggestions(checks),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}