import { MobileCheck, MobileFriendlyInput, MobileFriendlyResult } from "./types";

const DEFAULT_TIMEOUT_MS = 10000;
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

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

function collectSuggestions(checks: MobileCheck[]): string[] {
  const suggestions = checks
    .filter((check) => check.status !== "ok")
    .map((check) => `- ${check.message}`);
  return [...new Set(suggestions)];
}

function checkStatus(condition: boolean): "ok" | "attention" {
  return condition ? "ok" : "attention";
}

async function fetchWithUA(url: string, userAgent: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const start = Date.now();
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
      },
    });
    const responseTimeMs = Date.now() - start;
    const html = await response.text();

    return {
      response,
      html,
      responseTimeMs,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkMobileFriendly(input: MobileFriendlyInput): Promise<MobileFriendlyResult> {
  const normalizedUrl = normalizeUrl(input.url);
  const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const desktopData = await fetchWithUA(normalizedUrl, DESKTOP_UA, timeoutMs);
  const mobileData = await fetchWithUA(normalizedUrl, MOBILE_UA, timeoutMs);

  const viewport = extractFirstMatch(
    mobileData.html,
    /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["'][^>]*>/i,
  );
  const viewportResponsive = viewport.toLowerCase().includes("width=device-width");
  const hasMediaQueries = /@media\s*\(/i.test(mobileData.html);
  const hasAppleTouchIcon = /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*>/i.test(
    mobileData.html,
  );
  const mobileStatusOk = mobileData.response.ok;
  const desktopStatusOk = desktopData.response.ok;
  const varyHeader = mobileData.response.headers.get("vary") ?? "";
  const userAgentVary = varyHeader.toLowerCase().includes("user-agent");

  const checks: MobileCheck[] = [
    {
      id: "http-status-mobile",
      label: "Réponse HTTP mobile",
      status: mobileStatusOk ? "ok" : "error",
      message: mobileStatusOk
        ? "La page répond correctement avec un user-agent mobile."
        : "La page ne répond pas correctement sur mobile.",
      value: String(mobileData.response.status),
    },
    {
      id: "http-status-desktop",
      label: "Réponse HTTP desktop",
      status: desktopStatusOk ? "ok" : "attention",
      message: desktopStatusOk
        ? "La page répond correctement sur desktop."
        : "Réponse desktop non idéale.",
      value: String(desktopData.response.status),
    },
    {
      id: "viewport",
      label: "Meta viewport",
      status: checkStatus(viewportResponsive),
      message: viewportResponsive
        ? "La meta viewport est adaptée au mobile."
        : "Ajoute meta viewport avec width=device-width.",
      value: viewport || "Absente",
    },
    {
      id: "media-queries",
      label: "Indices de responsive CSS",
      status: checkStatus(hasMediaQueries),
      message: hasMediaQueries
        ? "Des media queries sont détectées dans le HTML."
        : "Aucun indice de media query détecté dans le HTML.",
    },
    {
      id: "touch-icon",
      label: "Icône mobile (apple-touch-icon)",
      status: checkStatus(hasAppleTouchIcon),
      message: hasAppleTouchIcon
        ? "Une icône mobile est présente."
        : "Ajoute un lien apple-touch-icon.",
    },
    {
      id: "adaptive-serving",
      label: "Vary: User-Agent",
      status: checkStatus(userAgentVary),
      message: userAgentVary
        ? "Le serveur indique une variation selon le user-agent."
        : "Ajoute Vary: User-Agent si tu sers un contenu différent mobile/desktop.",
      value: varyHeader || "Absent",
    },
  ];

  const okCount = checks.filter((check) => check.status === "ok").length;
  const score = Math.round((okCount / checks.length) * 100);

  return {
    normalizedUrl,
    httpStatus: mobileData.response.status,
    responseTimeMs: mobileData.responseTimeMs,
    score,
    checks,
    suggestions: collectSuggestions(checks),
  };
}