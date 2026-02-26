import { BasicSeoInput, BasicSeoResult, SeoCheck } from "./types";

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function extractFirstMatch(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  if (!match || !match[1]) {
    return "";
  }

  return match[1].trim();
}

function collectSuggestions(checks: SeoCheck[]): string[] {
  const suggestions = checks
    .filter((check) => check.status !== "ok")
    .map((check) => `- ${check.message}`);
  return [...new Set(suggestions)];
}

function checkStatus(condition: boolean): "ok" | "attention" {
  return condition ? "ok" : "attention";
}

export async function analyzeBasicSeo(input: BasicSeoInput): Promise<BasicSeoResult> {
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
        "User-Agent": "Creasites-BasicSeoTools/1.0",
      },
    });
    const responseTimeMs = Date.now() - start;
    const html = await response.text();

    const title = extractFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = extractFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
    const robots = extractFirstMatch(
      html,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) ?? [];
    const h1Count = h1Matches.length;
    const canonical = extractFirstMatch(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    );
    const lang = extractFirstMatch(html, /<html[^>]+lang=["']([^"']+)["'][^>]*>/i);
    const ogTitle = extractFirstMatch(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
    const ogDescription = extractFirstMatch(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    );
    const contentType = response.headers.get("content-type") ?? "";

    const checks: SeoCheck[] = [
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
        id: "title-length",
        label: "Balise title (longueur)",
        status: checkStatus(title.length >= 10 && title.length <= 60),
        message:
          title.length >= 10 && title.length <= 60
            ? "Le title a une longueur correcte."
            : "Ajuste le title entre 10 et 60 caractères.",
        value: title ? `${title.length} caractères` : "Absent",
      },
      {
        id: "meta-description-length",
        label: "Meta description (longueur)",
        status: checkStatus(description.length >= 70 && description.length <= 160),
        message:
          description.length >= 70 && description.length <= 160
            ? "La meta description a une longueur correcte."
            : "Ajuste la meta description entre 70 et 160 caractères.",
        value: description ? `${description.length} caractères` : "Absente",
      },
      {
        id: "h1-count",
        label: "Nombre de H1",
        status: checkStatus(h1Count === 1),
        message: h1Count === 1 ? "Un seul H1 est présent." : "Utilise un seul H1 principal.",
        value: String(h1Count),
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
        id: "lang",
        label: "Attribut lang",
        status: checkStatus(lang.length > 0),
        message: lang.length > 0 ? "L'attribut lang est présent." : "Ajoute l'attribut lang sur html.",
        value: lang || undefined,
      },
      {
        id: "robots",
        label: "Meta robots",
        status: checkStatus(robots.length > 0),
        message: robots.length > 0 ? "La meta robots est présente." : "Ajoute une meta robots.",
        value: robots || undefined,
      },
      {
        id: "open-graph",
        label: "Open Graph (title + description)",
        status: checkStatus(ogTitle.length > 0 && ogDescription.length > 0),
        message:
          ogTitle.length > 0 && ogDescription.length > 0
            ? "Les balises Open Graph principales sont présentes."
            : "Ajoute og:title et og:description.",
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
    ];

    const okCount = checks.filter((check) => check.status === "ok").length;
    const score = Math.round((okCount / checks.length) * 100);

    return {
      normalizedUrl,
      httpStatus: response.status,
      responseTimeMs,
      score,
      checks,
      suggestions: collectSuggestions(checks),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}