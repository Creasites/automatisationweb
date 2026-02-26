export interface MetaTagEntry {
  key: string;
  value: string;
}

export interface MetaTagsInput {
  url: string;
  timeoutMs?: number;
}

export interface MetaTagsResult {
  normalizedUrl: string;
  httpStatus: number | null;
  responseTimeMs: number | null;
  title: string;
  metaTags: MetaTagEntry[];
  linkTags: MetaTagEntry[];
}