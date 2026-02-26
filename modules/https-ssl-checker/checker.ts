import tls from "node:tls";
import { HttpsSslInput, HttpsSslResult, SslCheck } from "./types";

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeUrl(value: string): URL {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol);
}

function suggestionList(checks: SslCheck[]): string[] {
  const suggestions = checks
    .filter((check) => check.status !== "ok")
    .map((check) => `- ${check.message}`);
  return [...new Set(suggestions)];
}

function checkStatus(condition: boolean): "ok" | "attention" {
  return condition ? "ok" : "attention";
}

interface CertificateInfo {
  validFrom: string;
  validTo: string;
  authorized: boolean;
}

async function getCertificateInfo(hostname: string, timeoutMs: number): Promise<CertificateInfo | null> {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
    });

    const timer = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, timeoutMs);

    socket.once("secureConnect", () => {
      const cert = socket.getPeerCertificate();
      clearTimeout(timer);
      socket.end();

      if (!cert || !cert.valid_to || !cert.valid_from) {
        resolve(null);
        return;
      }

      resolve({
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        authorized: socket.authorized,
      });
    });

    socket.once("error", () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

export async function checkHttpsSsl(input: HttpsSslInput): Promise<HttpsSslResult> {
  const normalized = normalizeUrl(input.url);
  const timeoutMs = Math.min(input.timeoutMs ?? DEFAULT_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const hostname = normalized.hostname;
  const pathWithQuery = `${normalized.pathname}${normalized.search}`;
  const httpsUrl = `https://${hostname}${pathWithQuery}`;
  const httpUrl = `http://${hostname}${pathWithQuery}`;

  const httpsController = new AbortController();
  const httpsTimer = setTimeout(() => httpsController.abort(), timeoutMs);

  let httpsResponse: Response | null = null;
  let httpsError = false;

  try {
    httpsResponse = await fetch(httpsUrl, {
      redirect: "follow",
      signal: httpsController.signal,
      headers: {
        "User-Agent": "Creasites-HttpsSslChecker/1.0",
      },
    });
  } catch {
    httpsError = true;
  } finally {
    clearTimeout(httpsTimer);
  }

  const httpController = new AbortController();
  const httpTimer = setTimeout(() => httpController.abort(), timeoutMs);
  let httpResponse: Response | null = null;

  try {
    httpResponse = await fetch(httpUrl, {
      redirect: "manual",
      signal: httpController.signal,
      headers: {
        "User-Agent": "Creasites-HttpsSslChecker/1.0",
      },
    });
  } catch {
    httpResponse = null;
  } finally {
    clearTimeout(httpTimer);
  }

  const certificateInfo = await getCertificateInfo(hostname, timeoutMs);
  const hstsHeader = httpsResponse?.headers.get("strict-transport-security") ?? "";
  const locationHeader = httpResponse?.headers.get("location") ?? "";
  const redirectsToHttps = locationHeader.toLowerCase().startsWith("https://");

  const checks: SslCheck[] = [
    {
      id: "https-reachable",
      label: "Accessibilité HTTPS",
      status: httpsResponse && !httpsError ? "ok" : "error",
      message:
        httpsResponse && !httpsError
          ? "Le site est accessible en HTTPS."
          : "Le site n'est pas accessible en HTTPS.",
      value: httpsResponse ? String(httpsResponse.status) : undefined,
    },
    {
      id: "http-redirect",
      label: "Redirection HTTP vers HTTPS",
      status: checkStatus(redirectsToHttps),
      message: redirectsToHttps
        ? "La redirection HTTP vers HTTPS est active."
        : "Ajoute une redirection HTTP vers HTTPS.",
      value: locationHeader || undefined,
    },
    {
      id: "hsts",
      label: "Header HSTS",
      status: checkStatus(hstsHeader.length > 0),
      message:
        hstsHeader.length > 0
          ? "Le header Strict-Transport-Security est présent."
          : "Ajoute le header Strict-Transport-Security.",
      value: hstsHeader || undefined,
    },
    {
      id: "certificate-available",
      label: "Certificat SSL détecté",
      status: checkStatus(certificateInfo !== null),
      message:
        certificateInfo !== null
          ? "Le certificat SSL est bien détecté."
          : "Impossible de lire le certificat SSL.",
    },
    {
      id: "certificate-validity",
      label: "Période de validité",
      status: checkStatus(Boolean(certificateInfo?.validTo)),
      message:
        certificateInfo?.validTo
          ? "La date d'expiration du certificat est disponible."
          : "Date d'expiration non disponible.",
      value: certificateInfo?.validTo,
    },
  ];

  const okCount = checks.filter((check) => check.status === "ok").length;
  const score = Math.round((okCount / checks.length) * 100);

  return {
    normalizedUrl: httpsUrl,
    checks,
    score,
    suggestions: suggestionList(checks),
  };
}