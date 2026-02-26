import { MetaTagEntry, MetaTagsInput, MetaTagsResult } from "./types";

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

function collectMetaTags(html: string): MetaTagEntry[] {
  const tags: MetaTagEntry[] = [];
  const regex = /<meta\s+[^>]*>/gi;
  const matches = html.match(regex) ?? [];

  for (const tag of matches) {
    const name = extractFirstMatch(tag, /name=["']([^"']+)["']/i);
    const property = extractFirstMatch(tag, /property=["']([^"']+)["']/i);
    const content = extractFirstMatch(tag, /content=["']([^"']*)["']/i);

    const key = name || property;
    if (!key || !content) {
      continue;
    }

    tags.push({ key, value: content });
  }

  return tags;
}

function collectLinkTags(html: string): MetaTagEntry[] {
  const tags: MetaTagEntry[] = [];
  const regex = /<link\s+[^>]*>/gi;
  const matches = html.match(regex) ?? [];

  for (const tag of matches) {
    const rel = extractFirstMatch(tag, /rel=["']([^"']+)["']/i);
    const href = extractFirstMatch(tag, /href=["']([^"']*)["']/i);

    if (!rel || !href) {
      continue;
    }

    tags.push({ key: rel, value: href });
  }

  return tags;
}

export async function extractMetaTags(input: MetaTagsInput): Promise<MetaTagsResult> {
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
        "User-Agent": "Creasites-MetaTagsExtractor/1.0",
      },
    });
    const responseTimeMs = Date.now() - start;
    const html = await response.text();

    const title = extractFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);

    return {
      normalizedUrl,
      httpStatus: response.status,
      responseTimeMs,
      title,
      metaTags: collectMetaTags(html),
      linkTags: collectLinkTags(html),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}